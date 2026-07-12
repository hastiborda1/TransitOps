import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";

export const Route = createFileRoute("/_app/driver")({
  component: DriverDashboard,
});

function DriverDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
      <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center">
        <User className="w-8 h-8 text-orange-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Driver Dashboard</h1>
      <p className="text-muted-foreground max-w-md">
        Welcome to the Driver portal. Assigned trips, odometer updates, and fuel consumption logging will appear here.
      </p>
    </div>
  );
}
