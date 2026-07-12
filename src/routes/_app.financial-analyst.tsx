import { createFileRoute, Link } from "@tanstack/react-router";
import { DollarSign, Percent, TrendingUp, ArrowLeft, Receipt, Fuel } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/_app/financial-analyst")({
  component: FinancialAnalystPage,
});

const mockMonthlyData = [
  { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
  { month: "Feb", revenue: 48000, expenses: 31000, profit: 17000 },
  { month: "Mar", revenue: 52000, expenses: 35000, profit: 17000 },
  { month: "Apr", revenue: 58000, expenses: 38000, profit: 20000 },
  { month: "May", revenue: 63000, expenses: 40000, profit: 23000 },
  { month: "Jun", revenue: 69000, expenses: 43000, profit: 26000 },
];

const mockExpenses = [
  { category: "Fuel Costs", amount: 24950, percentage: "48%" },
  { category: "Driver Salaries", amount: 15400, percentage: "30%" },
  { category: "Vehicle Maintenance", amount: 8200, percentage: "16%" },
  { category: "Insurance & Licenses", amount: 3400, percentage: "6%" },
];

function FinancialAnalystPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Financial Analyst Portal</h1>
          <p className="text-muted-foreground text-sm">Analyze fleet operational costs, vehicle ROI, and fuel efficiency trends.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Fleet Profitability" value="$26,000" delta={8.4} hint="Net profit (June)" icon={TrendingUp} tone="success" />
        <KpiCard label="Total Fuel Cost (MTD)" value="$24,950" delta={-2.1} hint="vs target budget" icon={Fuel} tone="warning" />
        <KpiCard label="Fleet ROI" value="18.5%" delta={4.2} hint="Annualized return" icon={Percent} tone="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 gold-stripe-left">
          <h3 className="text-lg font-semibold mb-4">Financial Performance (H1 2026)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMonthlyData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" name="Revenue ($)" dataKey="revenue" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#revenueFill)" />
                <Area type="monotone" name="Expenses ($)" dataKey="expenses" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#expensesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Cost Breakdown
          </h3>
          <div className="space-y-4">
            {mockExpenses.map((exp, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{exp.category}</span>
                  <span className="font-semibold text-muted-foreground">${exp.amount.toLocaleString()} ({exp.percentage})</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: exp.percentage }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
