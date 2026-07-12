import { useEffect } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { Truck, ShieldCheck, PieChart, User, ShieldAlert } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RoleCard } from "@/components/auth/RoleCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { authService } from "@/services/api";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.role === "admin") throw redirect({ to: "/admin" });
      if (user.role === "fleet-manager") throw redirect({ to: "/dashboard" });
      if (user.role === "safety-officer") throw redirect({ to: "/safety" });
      if (user.role === "financial-analyst") throw redirect({ to: "/finance" });
      if (user.role === "driver") throw redirect({ to: "/driver" });
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Select Role — TransitOps" },
      { name: "description", content: "Select your role to sign in." },
    ],
  }),
  component: LoginSelectionPage,
});

const roles = [
  {
    id: "fleet-manager",
    title: "Fleet Manager",
    icon: Truck,
    path: "/login/fleet-manager",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "safety-officer",
    title: "Safety",
    icon: ShieldCheck,
    path: "/login/safety",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "financial-analyst",
    title: "Analyst",
    icon: PieChart,
    path: "/login/finance",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "driver",
    title: "Driver",
    icon: User,
    path: "/login/driver",
    color: "bg-orange-500/10 text-orange-500",
  },
];

function LoginSelectionPage() {
  const navigate = useNavigate();
  const { getUserRole } = useAuth();

  useEffect(() => {
    const currentRole = getUserRole();
    if (currentRole) {
      if (currentRole === "admin") navigate({ to: "/admin" });
      else if (currentRole === "fleet-manager") navigate({ to: "/dashboard" });
      else if (currentRole === "safety-officer") navigate({ to: "/safety" });
      else if (currentRole === "financial-analyst") navigate({ to: "/finance" });
      else if (currentRole === "driver") navigate({ to: "/driver" });
    }
  }, [getUserRole, navigate]);

  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-6">
        <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/25">
          <Truck className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome to TransitOps</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Please select your role to sign in</p>
      </div>

      <section className="bg-card rounded-xl p-2.5 border shadow-sm flex flex-col gap-2 w-full max-w-[400px] mx-auto">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            id={role.id}
            title={role.title}
            description={`Access ${role.title} portal`}
            icon={role.icon}
            path={role.path}
            colorClass={role.color}
          />
        ))}
      </section>
      
      <div className="mt-6 flex justify-center">
        <Button 
          variant="ghost" 
          className="text-muted-foreground hover:text-foreground text-xs"
          onClick={() => navigate({ to: "/admin/login" })}
        >
          <ShieldAlert className="w-4 h-4 mr-1.5" />
          Administrator Login
        </Button>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-[10px] text-muted-foreground">© 2026 TransitOps Logistics Systems. All rights reserved.</p>
      </footer>
    </AuthLayout>
  );
}
