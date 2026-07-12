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
  Shield,
  Calendar,
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
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCsv } from "@/lib/utils";

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
  const user = authService.getCurrentUser() || { role: "manager" };
  const canNewTrip = user.role === "manager" || user.role === "admin";
  const canExport = user.role !== "driver";
  const role = user.role;

<<<<<<< Updated upstream
  console.log("DEBUG: vehiclesQ.data is:", vehiclesQ.data);
  console.log("DEBUG: driversQ.data is:", driversQ.data);
  console.log("DEBUG: tripsQ.data is:", tripsQ.data);

  // Compute precise specification KPIs
  const totalVehicles = 0;
  const activeVehicles = 0;
  const availableVehicles = 0;
  const maintenanceVehicles = 0;

  const activeTrips = 0;
  const pendingTrips = 0;
  const driversOnDuty = 0;

  const fleetUtilization = "0.0";

  const handleExport = () => {
    if (!vehiclesQ.data) return;
    const headers = ["Plate", "Make", "Model", "Type", "Status", "Odometer", "Fuel Type", "Max Load (kg)", "Acquisition Cost ($)"];
    const rows = vehiclesQ.data.map((v: any) => [
      v.plate,
      v.make,
      v.model,
      v.type,
      v.status,
      v.odometer,
      v.fuelType,
      v.maxLoad ?? 1000,
      v.acquisitionCost ?? 20000,
    ]);
    exportToCsv("TransitOps_Fleet_Status_Report", headers, rows);
  };
=======
  const activeVehicles = vehiclesQ.data?.filter((v) => v.status === "active").length ?? 0;
  const availableVehicles = vehiclesQ.data?.filter((v) => v.status === "idle").length ?? 0;
  const inMaintenanceVehicles = vehiclesQ.data?.filter((v) => v.status === "maintenance").length ?? 0;
  const totalVehicles = vehiclesQ.data?.length ?? 0;
  const activeDrivers = driversQ.data?.filter((d) => d.status !== "off-duty" && d.status !== "suspended").length ?? 0;
  const inProgressTrips = tripsQ.data?.filter((t) => t.status === "in-progress").length ?? 0;
  const pendingTrips = tripsQ.data?.filter((t) => t.status === "scheduled").length ?? 0;
  const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  if (role === "safety") {
    const driversList = driversQ.data || [];
    
    // Safety & Compliance metrics
    const totalDrivers = driversList.length;
    const avgSafetyScore = totalDrivers > 0 
      ? Math.round((driversList.reduce((acc, d) => acc + (d.rating || 0), 0) / totalDrivers) * 20) 
      : 90;
      
    const suspendedDrivers = driversList.filter(d => d.status === "suspended").length;
    
    const expiredLicenses = driversList.filter(d => {
      if (!d.licenseExpiry) return false;
      return new Date(d.licenseExpiry) < new Date();
    });

    const activeComplianceAlerts = driversList.filter(d => {
      return d.status === "suspended" || (d.licenseExpiry && new Date(d.licenseExpiry) < new Date());
    });

    return (
      <>
        <PageHeader
          title="Safety & Compliance Portal"
          description="Ensures driver compliance, tracks license validity, and monitors safety scores."
          breadcrumbs={[{ label: "Dashboard" }]}
          actions={
            canExport && <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export Report</Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <KpiCard label="Average Safety Score" value={`${avgSafetyScore} / 100`} delta={1.8} hint="compliance target > 85" icon={Shield} tone="success" />
          <KpiCard label="Active Drivers" value={`${activeDrivers}`} delta={2.1} hint="on-duty" icon={Users} tone="primary" />
          <KpiCard label="Suspended Accounts" value={suspendedDrivers.toString()} delta={0} hint="immediate review" icon={AlertTriangle} tone={suspendedDrivers > 0 ? "destructive" : "info"} />
          <KpiCard label="Expired Licenses" value={expiredLicenses.length.toString()} delta={0} hint="action required" icon={Calendar} tone={expiredLicenses.length > 0 ? "destructive" : "info"} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <Card className="p-5 lg:col-span-2 gold-stripe-left">
            <h3 className="font-semibold text-base mb-1">Driver Compliance Status</h3>
            <p className="text-xs text-muted-foreground mb-4">Live license status and compliance checklist</p>
            <div className="space-y-4">
              {driversQ.isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="py-2">Driver</th>
                        <th className="py-2">License Category</th>
                        <th className="py-2">Expiry Date</th>
                        <th className="py-2">Safety Score</th>
                        <th className="py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driversList.map(d => {
                        const score = Math.round((d.rating || 0) * 20);
                        const isExp = d.licenseExpiry ? new Date(d.licenseExpiry) < new Date() : false;
                        return (
                          <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                            <td className="py-2.5 font-medium">{d.name}</td>
                            <td className="py-2.5 text-muted-foreground">{d.licenseCategory || "Light Truck"}</td>
                            <td className="py-2.5">
                              <span className={isExp ? "text-destructive font-semibold" : ""}>
                                {d.licenseExpiry || "N/A"}
                              </span>
                            </td>
                            <td className="py-2.5 font-semibold">{score} %</td>
                            <td className="py-2.5 text-right">
                              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${isExp || d.status === "suspended" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
                                {isExp ? "Expired" : d.status === "suspended" ? "Suspended" : "Compliant"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1">Compliance Alerts</h3>
            <p className="text-xs text-muted-foreground mb-4">Requires immediate intervention</p>
            <ul className="space-y-3">
              {activeComplianceAlerts.length === 0 ? (
                <li className="text-sm text-muted-foreground text-center py-6">All drivers are compliant</li>
              ) : (
                activeComplianceAlerts.map(d => {
                  const isExp = d.licenseExpiry ? new Date(d.licenseExpiry) < new Date() : false;
                  return (
                    <AlertRow
                      key={d.id}
                      icon={<AlertTriangle className="h-4 w-4" />}
                      tone="destructive"
                      title={isExp ? `${d.name} License Expired` : `${d.name} Suspended`}
                      meta={isExp ? `Expired on ${d.licenseExpiry}` : "Suspended from operations"}
                    />
                  );
                })
              )}
            </ul>
          </Card>
        </div>
      </>
    );
  }
>>>>>>> Stashed changes

  return (
    <>
      <PageHeader
        title="Fleet Overview"
        description="Real-time snapshot of your operations."
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <>
<<<<<<< Updated upstream
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/trips" })}>
              <Plus className="h-4 w-4" /> New Trip
            </Button>
=======
            {canExport && <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>}
            {canNewTrip && <Button size="sm"><Plus className="h-4 w-4" /> New Trip</Button>}
>>>>>>> Stashed changes
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
          </div>
        </div>
      </div>

      {/* Aligned spec KPIs grid */}
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
            {monthlyQ.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyQ.data}>
                  <defs>
                    <linearGradient id="tripsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="distFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="trips" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#tripsFill)" />
                  <Area type="monotone" dataKey="distance" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#distFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-1">Alerts</h3>
          <p className="text-xs text-muted-foreground mb-4">Needs attention</p>
          <ul className="space-y-3">
            <AlertRow icon={<AlertTriangle className="h-4 w-4" />} tone="destructive" title="Brake service overdue" meta="TX-3391 · Due 5 days ago" />
            <AlertRow icon={<Fuel className="h-4 w-4" />} tone="warning" title="Low fuel efficiency" meta="TX-9012 · -12% this week" />
            <AlertRow icon={<DollarSign className="h-4 w-4" />} tone="info" title="Expense awaiting approval" meta="Maintenance · $2,400" />
            <AlertRow icon={<Truck className="h-4 w-4" />} tone="warning" title="Inspection due soon" meta="TX-2251 · Aug 1" />
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
          {(tripsQ.data?.filter((t) => t.status === "Dispatched") || []).map((t) => (
            <div key={t.id} className="rounded-lg border p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                <StatusBadge status={t.status} />
              </div>
              <p className="font-semibold text-sm truncate">{t.origin} → {t.destination}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.driver} · {t.vehicle} · {t.distance} km</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function AlertRow({ icon, tone, title, meta }: { icon: React.ReactNode; tone: "destructive" | "warning" | "info"; title: string; meta: string }) {
  const bg = {
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 [color:oklch(0.45_0.15_75)]",
    info: "bg-info/10 text-info",
  }[tone];
  return (
    <li className="flex items-start gap-3">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${bg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{meta}</p>
      </div>
    </li>
  );
}
