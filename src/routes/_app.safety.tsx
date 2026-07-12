import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_app/safety")({
  component: SafetyDashboard,
});

function SafetyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
        <ShieldCheck className="w-8 h-8 text-emerald-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Safety Dashboard</h1>
      <p className="text-muted-foreground max-w-md">
        Welcome to the Safety Officer portal. Compliance reports, license expiry monitoring, and safety scores will appear here.
      </p>
    </div>
  );
}
