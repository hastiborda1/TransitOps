import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Truck, ShieldCheck, PieChart, User, ShieldAlert } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/api";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (user) {
      throw redirect({
        to: "/dashboard",
      });
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
    path: "/login/safety-officer",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "financial-analyst",
    title: "Analyst",
    icon: PieChart,
    path: "/login/financial-analyst",
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
  return (
    <AuthLayout>
      <div className="flex flex-col items-center mb-6">
        <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/25">
          <Truck className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome to TransitOps</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Please select your role to sign in</p>
      </div>

      <section className="bg-card rounded-xl p-2.5 border shadow-sm flex flex-row gap-2 justify-between w-full max-w-[400px] mx-auto">
        {roles.map((role) => (
          <Link
            key={role.id}
            to={role.path}
            className="flex-1 min-w-[70px] flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted/65 transition-colors group text-center"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.color} group-hover:scale-105 transition-transform`}>
              <role.icon className="w-5.5 h-5.5" />
            </div>
            <span className="text-[10px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {role.title}
            </span>
          </Link>
        ))}
      </section>
      
      <div className="mt-6 flex justify-center">
        <Link to="/admin/login">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-xs">
            <ShieldAlert className="w-4 h-4 mr-1.5" />
            Administrator Login
          </Button>
        </Link>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-[10px] text-muted-foreground">© 2026 TransitOps Logistics Systems. All rights reserved.</p>
      </footer>
    </AuthLayout>
  );
}
