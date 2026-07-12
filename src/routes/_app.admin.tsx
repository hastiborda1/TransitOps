import { createFileRoute } from "@tanstack/react-router";
import { Server } from "lucide-react";

export const Route = createFileRoute("/_app/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-xl">
        <Server className="w-8 h-8 text-zinc-400" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">System Administration</h1>
      <p className="text-muted-foreground max-w-md font-mono text-sm">
        Super Admin portal. Full system controls, user role assignments, and global configurations will appear here.
      </p>
    </div>
  );
}
