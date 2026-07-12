import { createFileRoute, redirect } from "@tanstack/react-router";
import { AUTH_KEY } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      try {
        const data = localStorage.getItem(AUTH_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          const role = parsed?.role;
          if (role === "admin") throw redirect({ to: "/admin" });
          if (role === "fleet-manager") throw redirect({ to: "/dashboard" });
          if (role === "safety-officer") throw redirect({ to: "/safety" });
          if (role === "financial-analyst") throw redirect({ to: "/finance" });
          if (role === "driver") throw redirect({ to: "/driver" });
        }
      } catch (e) {
        // Ignored
      }
    }
    throw redirect({ to: "/login" });
  },
});
