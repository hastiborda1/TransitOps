import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, useRouter } from "@tanstack/react-router";
import { useAuth, UserRole } from "@/lib/auth";
import { UnauthorizedAccess } from "./UnauthorizedAccess";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

// Role-based route authorization map
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/admin': ['admin'],
  '/dashboard': ['fleet-manager', 'admin'],
  '/safety': ['safety-officer', 'fleet-manager', 'admin'],
  '/safety-driver': ['safety-officer', 'fleet-manager', 'admin'],
  '/finance': ['financial-analyst', 'fleet-manager', 'admin'],
  '/financial-analyst': ['financial-analyst', 'fleet-manager', 'admin'],
  '/driver': ['driver', 'fleet-manager', 'admin'],
  '/vehicles': ['fleet-manager', 'admin'],
  '/trips': ['fleet-manager', 'admin'],
  '/drivers': ['fleet-manager', 'admin'],
  '/maintenance': ['fleet-manager', 'admin'],
  '/fuel': ['fleet-manager', 'admin'],
  '/expenses': ['fleet-manager', 'financial-analyst', 'admin'],
  '/analytics': ['fleet-manager', 'financial-analyst', 'admin'],
  '/settings': ['fleet-manager', 'admin'],
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { getUserRole } = useAuth();
  const role = getUserRole();
  const location = useLocation();
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();

  // Prevent hydration mismatch when reading localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (!role) {
      router.navigate({ to: "/login", replace: true });
      return;
    }

    if (location.pathname === "/") {
      if (role === "admin") router.navigate({ to: "/admin", replace: true });
      else if (role === "fleet-manager") router.navigate({ to: "/dashboard", replace: true });
      else if (role === "safety-officer") router.navigate({ to: "/safety", replace: true });
      else if (role === "financial-analyst") router.navigate({ to: "/finance", replace: true });
      else if (role === "driver") router.navigate({ to: "/driver", replace: true });
    }
  }, [isClient, role, location.pathname, router]);

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  // 1. If not logged in, don't render children
  if (!role) {
    return null;
  }

  const currentPath = location.pathname;

  // 2. Component-level explicit allowed roles override
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <UnauthorizedAccess />;
  }

  // 3. Explicitly bypass public routes to NEVER show Unauthorized Access
  if (currentPath === "/" || currentPath === "/login" || currentPath === "/admin/login" || currentPath.startsWith("/login/")) {
    return <>{children}</>;
  }

  // 4. Global route permission checking
  let isAuthorized = true;
  for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (currentPath === route || currentPath.startsWith(`${route}/`)) {
      if (!roles.includes(role)) {
        isAuthorized = false;
        break;
      }
    }
  }

  if (!isAuthorized) {
    return <UnauthorizedAccess />;
  }

  // 5. Authorized, render children
  return <>{children}</>;
}
