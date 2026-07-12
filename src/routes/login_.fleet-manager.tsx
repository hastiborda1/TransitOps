import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/login_/fleet-manager")({
  head: () => ({
    meta: [
      { title: "Fleet Manager Sign In — TransitOps" },
    ],
  }),
  component: FleetManagerLoginPage,
});

function FleetManagerLoginPage() {
  return (
    <AuthLayout>
      <LoginForm 
        role="fleet-manager"
        title="Fleet Manager"
        icon={Truck}
        redirectUrl="/dashboard"
        defaultIdentifier="manager@transitops.com"
        colorClass="bg-blue-500"
        buttonClass="bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
      />
    </AuthLayout>
  );
}
