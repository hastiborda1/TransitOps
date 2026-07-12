import { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth, UserRole } from "@/lib/auth";
import { UnauthorizedAccess } from "./UnauthorizedAccess";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { getUserRole } = useAuth();
  const role = getUserRole();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <UnauthorizedAccess />;
  }

  return <>{children}</>;
}
