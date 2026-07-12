import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Fuel, Route as RouteIcon, Timer } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TransitOps" }, { name: "description", content: "Fleet KPIs, cost breakdowns and performance trends." }] }),
  component: AnalyticsPage,
});

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-muted-foreground)"];

function AnalyticsPage() {
  const monthlyQ = useQuery({ queryKey: ["analytics", "monthly"], queryFn: api.analytics.monthly });
  const breakdownQ = useQuery({ queryKey: ["analytics", "breakdown"], queryFn: api.analytics.breakdown });

  return (
    <>
      <PageHeader title="Analytics" description="Insight across operations, cost and efficiency." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <KpiCard label="Total Distance" value="61,200 km" delta={4.8} hint="this month" icon={RouteIcon} />
        <KpiCard label="Avg Trip Time" value="4h 12m" delta={-2.1} hint="vs last month" icon={Timer} tone="info" />
        <KpiCard label="Fuel Efficiency" value="8.2 L/100km" delta={1.4} hint="improving" icon={Fuel} tone="success" />
        <KpiCard label="Cost per km" value="$0.78" delta={-3.2} hint="vs last month" icon={DollarSign} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold">Monthly trips</h3>
          <p className="text-xs text-muted-foreground mb-4">Trips completed per month</p>
          <div className="h-72">
            {monthlyQ.isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer>
                <BarChart data={monthlyQ.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" fontSize={12} stroke="var(--color-muted-foreground)" />
                  <YAxis fontSize={12} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="trips" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Expense breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Where the money goes</p>
          <div className="h-72">
            {breakdownQ.isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={breakdownQ.data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {breakdownQ.data?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold">Fuel cost trend</h3>
        <p className="text-xs text-muted-foreground mb-4">Monthly fuel spend</p>
        <div className="h-72">
          {monthlyQ.isLoading ? <Skeleton className="h-full w-full" /> : (
            <ResponsiveContainer>
              <LineChart data={monthlyQ.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="fuelCost" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </>
  );
}
