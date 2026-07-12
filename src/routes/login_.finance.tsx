import { createFileRoute } from "@tanstack/react-router";
import { PieChart } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/login_/finance")({
  head: () => ({
    meta: [
      { title: "Financial Analyst Sign In — TransitOps" },
    ],
  }),
  component: FinancialAnalystLoginPage,
});

function FinancialAnalystLoginPage() {
  return (
    <AuthLayout>
      <LoginForm 
        role="financial-analyst"
        title="Financial Analyst"
        icon={PieChart}
        redirectUrl="/finance"
        defaultIdentifier="finance@transitops.com"
        colorClass="bg-purple-500"
        buttonClass="bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20"
      />
    </AuthLayout>
  );
}
