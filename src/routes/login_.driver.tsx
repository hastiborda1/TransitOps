import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/login_/driver")({
  head: () => ({
    meta: [
      { title: "Driver Sign In — TransitOps" },
    ],
  }),
  component: DriverLoginPage,
});

function DriverLoginPage() {
  return (
    <AuthLayout>
      <LoginForm 
        role="driver"
        title="Driver"
        icon={User}
        redirectUrl="/driver"
        defaultIdentifier="DRV-001"
        identifierType="employee_id"
        colorClass="bg-orange-500"
        buttonClass="bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20"
      />
    </AuthLayout>
  );
}
