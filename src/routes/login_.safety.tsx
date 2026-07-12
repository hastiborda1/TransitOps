import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/login_/safety")({
  head: () => ({
    meta: [
      { title: "Safety Officer Sign In — TransitOps" },
    ],
  }),
  component: SafetyOfficerLoginPage,
});

function SafetyOfficerLoginPage() {
  return (
    <AuthLayout>
      <LoginForm 
        role="safety-officer"
        title="Safety Officer"
        icon={ShieldCheck}
        redirectUrl="/safety"
        defaultIdentifier="safety@transitops.com"
        colorClass="bg-emerald-500"
        buttonClass="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
      />
    </AuthLayout>
  );
}
