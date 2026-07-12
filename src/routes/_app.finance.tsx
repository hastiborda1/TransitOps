import { createFileRoute } from "@tanstack/react-router";
import { PieChart } from "lucide-react";

export const Route = createFileRoute("/_app/finance")({
  component: FinanceDashboard,
});

function FinanceDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
      <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
        <PieChart className="w-8 h-8 text-purple-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Dashboard</h1>
      <p className="text-muted-foreground max-w-md">
        Welcome to the Financial Analyst portal. Expense tracking, fuel costs, maintenance overheads, and ROI metrics will appear here.
      </p>
    </div>
  );
}
