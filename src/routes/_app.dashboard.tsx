import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Truck,
  Users,
  Route as RouteIcon,
  Fuel,
  AlertTriangle,
  DollarSign,
  Plus,
  Download,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { api, authService } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TransitOps" },
      { name: "description", content: "Fleet performance overview, KPIs and live activity." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const vehiclesQ = useQuery({ queryKey: ["vehicles"], queryFn: api.vehicles.list });
  const driversQ = useQuery({ queryKey: ["drivers"], queryFn: api.drivers.list });
  const tripsQ = useQuery({ queryKey: ["trips"], queryFn: api.trips.list });
  const monthlyQ = useQuery({ queryKey: ["analytics", "monthly"], queryFn: api.analytics.monthly });

  // Force all data values and computed KPIs to 0 as requested
  const totalVehicles = 0;
  const activeVehicles = 0;
  const availableVehicles = 0;
  const maintenanceVehicles = 0;
  const activeTrips = 0;
  const pendingTrips = 0;
  const driversOnDuty = 0;
  const fleetUtilization = "0.0";

  return (
    <>
      <PageHeader
        title="Fleet Overview"
        description="Real-time snapshot of your operations."
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/trips" })}>
              <Plus className="h-4 w-4" /> New Trip
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-lg bg-surface border gold-stripe-left">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Portal Redirection Quick Links</h4>
          <div className="flex flex-wrap gap-2.5">
            <Button asChild size="sm" className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
              <Link to="/safety-driver">Safety Driver Portal</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-primary/40 hover:bg-primary/10">
              <Link to="/financial-analyst">Financial Analyst Portal</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Aligned spec KPIs grid with zero values */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 mb-6">
        <KpiCard label="Active Vehicles" value={activeVehicles} hint={`Total: ${totalVehicles}`} icon={Truck} tone="primary" />
        <KpiCard label="Available Vehicles" value={availableVehicles} hint="Ready for dispatch" icon={Truck} tone="success" />
        <KpiCard label="In Maintenance" value={maintenanceVehicles} hint="In Shop" icon={Truck} tone="warning" />
        <KpiCard label="Active Trips" value={activeTrips} hint="On the road" icon={RouteIcon} tone="success" />
        <KpiCard label="Pending Trips" value={pendingTrips} hint="Draft schedule" icon={RouteIcon} tone="info" />
        <KpiCard label="Drivers On-Duty" value={driversOnDuty} hint="Active or Available" icon={Users} tone="info" />
        <KpiCard label="Fleet Utilization" value={`${fleetUtilization}%`} hint="Active / Total" icon={RouteIcon} tone="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold">Fleet performance</h3>
              <p className="text-xs text-muted-foreground">Trips and distance over the last 7 months</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="trips" stroke="var(--color-chart-1)" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="distance" stroke="var(--color-chart-2)" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-1">Alerts</h3>
          <p className="text-xs text-muted-foreground mb-4">Needs attention</p>
          <ul className="space-y-3">
            <li className="text-sm text-muted-foreground text-center py-6">No alerts active</li>
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Live trips</h3>
            <p className="text-xs text-muted-foreground">Currently on the road</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/trips" })}>View all</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <p className="text-sm text-muted-foreground col-span-3 text-center py-6">No active trips</p>
        </div>
      </Card>
    </>
  );
}
