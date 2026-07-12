import { createFileRoute } from "@tanstack/react-router";
import { Server } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Super Admin Gateway" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  return (
    <AuthLayout theme="dark">
      <LoginForm 
        role="admin"
        title="SYS_ADMIN"
        icon={Server}
        redirectUrl="/admin"
        defaultIdentifier=""
        theme="dark"
        isAdmin={true}
      />
    </AuthLayout>
  );
}
