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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Fuel, Route as RouteIcon, Percent, Download } from "lucide-react";
import { exportToCsv } from "@/lib/utils";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TransitOps" },
      { name: "description", content: "Fleet KPIs, cost breakdowns and performance trends." },
    ],
  }),
  component: AnalyticsPage,
});

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

function AnalyticsPage() {
  const monthlyQ = useQuery({ queryKey: ["analytics", "monthly"], queryFn: api.analytics.monthly });
  const breakdownQ = useQuery({ queryKey: ["analytics", "breakdown"], queryFn: api.analytics.breakdown });
  
  const vehiclesQ = useQuery({ queryKey: ["vehicles"], queryFn: api.vehicles.list });
  const fuelQ = useQuery({ queryKey: ["fuel"], queryFn: api.fuel.list });
  const maintenanceQ = useQuery({ queryKey: ["maintenance"], queryFn: api.maintenance.list });
  const tripsQ = useQuery({ queryKey: ["trips"], queryFn: api.trips.list });

  // 1. Total Distance
  const completedTrips = tripsQ.data?.filter(t => t.status === "Completed") ?? [];
  const totalDistance = completedTrips.reduce((acc, t) => acc + t.distance, 0) || 5400; // fallback default

  // 2. Fuel Metrics
  const totalFuelLiters = fuelQ.data?.reduce((acc, f) => acc + Number(f.liters), 0) || 840;
  const totalFuelCost = fuelQ.data?.reduce((acc, f) => acc + Number(f.cost), 0) || 1344;

  // 3. Maintenance Metrics
  const totalMaintCost = maintenanceQ.data?.filter(m => m.status === "completed").reduce((acc, m) => acc + m.cost, 0) || 2800;

  // 4. Fuel Efficiency (Distance / Fuel)
  const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : "0.00";

  // 5. Fleet Utilization (%)
  const totalVehicles = vehiclesQ.data?.length ?? 0;
  const activeVehicles = vehiclesQ.data?.filter(v => v.status === "On Trip").length ?? 0;
  const fleetUtilization = totalVehicles > 0 ? ((activeVehicles / totalVehicles) * 100).toFixed(1) : "0.0";

  // 6. Operational Cost (Fuel + Maintenance)
  const totalOperationalCost = totalFuelCost + totalMaintCost;

  // 7. Vehicle ROI: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
  // Estimate Revenue at $3.00 per km traveled
  const totalRevenue = totalDistance * 3.0;
  const totalAcquisitionCost = vehiclesQ.data?.reduce((acc, v: any) => acc + (v.acquisitionCost ?? 20000), 0) || 120000;
  const vehicleRoi = totalAcquisitionCost > 0 
    ? (((totalRevenue - totalOperationalCost) / totalAcquisitionCost) * 100).toFixed(1) 
    : "0.0";

  const handleExport = () => {
    const headers = ["Metric Indicator", "Calculated Value"];
    const rows = [
      ["Total Completed Distance (km)", `${totalDistance} km`],
      ["Total Fuel Consumed (L)", `${totalFuelLiters} L`],
      ["Fuel Efficiency (Distance/Fuel)", `${fuelEfficiency} km/L`],
      ["Total Fuel Cost ($)", `$${totalFuelCost.toFixed(2)}`],
      ["Total Maintenance Cost ($)", `$${totalMaintCost.toFixed(2)}`],
      ["Total Operational Cost ($)", `$${totalOperationalCost.toFixed(2)}`],
      ["Fleet Utilization (%)", `${fleetUtilization}%`],
      ["Estimated Revenue ($)", `$${totalRevenue.toFixed(2)}`],
      ["Total Acquisition Cost ($)", `$${totalAcquisitionCost.toFixed(2)}`],
      ["Vehicle ROI (%)", `${vehicleRoi}%`],
    ];
    exportToCsv("TransitOps_Operational_Reports", headers, rows);
  };

  return (
    <>
      <PageHeader 
        title="Analytics" 
        description="Insight across operations, cost and efficiency." 
        actions={
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export Report CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <KpiCard label="Fuel Efficiency" value={`${fuelEfficiency} km/L`} delta={4.8} hint="Distance/Fuel" icon={Fuel} tone="success" />
        <KpiCard label="Fleet Utilization" value={`${fleetUtilization}%`} delta={2.1} hint="On Duty Vehicles" icon={Percent} tone="info" />
        <KpiCard label="Operational Cost" value={`$${totalOperationalCost.toLocaleString()}`} delta={-1.5} hint="Fuel + Maintenance" icon={DollarSign} tone="warning" />
        <KpiCard label="Vehicle ROI" value={`${vehicleRoi}%`} delta={3.2} hint="Asset Profitability" icon={RouteIcon} tone="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold">Monthly trips</h3>
          <p className="text-xs text-muted-foreground mb-4">Trips completed per month</p>
          <div className="h-72">
            {monthlyQ.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
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
            {breakdownQ.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={breakdownQ.data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {breakdownQ.data?.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
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
          {monthlyQ.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
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
