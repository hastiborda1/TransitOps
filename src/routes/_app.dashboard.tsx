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
  CheckCircle2,
  UserX,
  TrendingUp,
  Receipt,
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
  const role = user.role;
  const canNewTrip = role === "manager" || role === "admin";
  const canExport = role !== "driver";

  // Data mapping from backend queries
  const vehiclesList = vehiclesQ.data || [];
  const driversList = driversQ.data || [];
  const tripsList = tripsQ.data || [];

  const totalVehicles = vehiclesList.length;
  const activeVehicles = vehiclesList.filter((v) => v.status === "active" || v.status === "On Trip").length;
  const availableVehicles = vehiclesList.filter((v) => v.status === "Available" || v.status === "idle").length;
  const maintenanceVehicles = vehiclesList.filter((v) => v.status === "In Shop" || v.status === "maintenance").length;

  const activeTrips = tripsList.filter((t) => t.status === "Dispatched" || t.status === "in-progress").length;
  const pendingTrips = tripsList.filter((t) => t.status === "Draft" || t.status === "scheduled").length;
  const driversOnDuty = driversList.filter((d) => d.status === "Available" || d.status === "available" || d.status === "On Trip" || d.status === "on-trip").length;
  const fleetUtilization = totalVehicles > 0 ? ((activeVehicles / totalVehicles) * 100).toFixed(1) : "0.0";

  const handleExport = () => {
    if (!vehiclesQ.data) return;
    const headers = ["Plate", "Make", "Model", "Type", "Status", "Odometer", "Fuel Type", "Max Load (kg)", "Acquisition Cost ($)"];
    const rows = vehiclesList.map((v: any) => [
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

  // 1. Safety Officer view
  if (role === "safety") {
    const totalDrivers = driversList.length;
    const avgSafetyScore = totalDrivers > 0 
      ? Math.round((driversList.reduce((acc, d) => acc + (d.rating || 0), 0) / totalDrivers) * 20) 
      : 90;
      
    const suspendedDrivers = driversList.filter(d => d.status === "suspended").length;
    const expiredLicenses = driversList.filter(d => d.licenseExpiry && new Date(d.licenseExpiry) < new Date());
    const activeComplianceAlerts = driversList.filter(d => d.status === "suspended" || (d.licenseExpiry && new Date(d.licenseExpiry) < new Date()));

    return (
      <div className="space-y-6">
        <PageHeader
          title="Safety & Compliance Portal"
          description="Ensures driver compliance, tracks license validity, and monitors safety scores."
          breadcrumbs={[{ label: "Dashboard" }]}
          actions={
            canExport && <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4" /> Export Report</Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Average Safety Score" value={`${avgSafetyScore} / 100`} delta={1.8} hint="compliance target > 85" icon={Shield} tone="success" />
          <KpiCard label="Drivers On Duty" value={`${driversOnDuty}`} delta={2.1} hint="on operations" icon={Users} tone="primary" />
          <KpiCard label="Suspended Accounts" value={suspendedDrivers.toString()} delta={0} hint="immediate review" icon={AlertTriangle} tone={suspendedDrivers > 0 ? "destructive" : "info"} />
          <KpiCard label="Expired Licenses" value={expiredLicenses.length.toString()} delta={0} hint="action required" icon={Calendar} tone={expiredLicenses.length > 0 ? "destructive" : "info"} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2 gold-stripe-left">
            <h3 className="font-semibold text-base mb-1">Driver Compliance Status</h3>
            <p className="text-xs text-muted-foreground mb-4">Live license status and compliance checklist</p>
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
                        <td className="py-2.5 text-muted-foreground">{d.licenseCategory || "Heavy Truck"}</td>
                        <td className="py-2.5">
                          <span className={isExp ? "text-destructive font-semibold" : ""}>
                            {d.licenseExpiry || "N/A"}
                          </span>
                        </td>
                        <td className="py-2.5 font-semibold">{score}%</td>
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
      </div>
    );
  }

  // 2. Financial Analyst view
  if (role === "finance") {
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

    return (
      <div className="space-y-6">
        <PageHeader
          title="Financial Analyst Portal"
          description="Analyze fleet operational costs, vehicle ROI, and fuel efficiency trends."
          breadcrumbs={[{ label: "Dashboard" }]}
          actions={
            canExport && <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4" /> Export Financials</Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard label="Fleet Profitability" value="$26,000" delta={8.4} hint="Net profit (June)" icon={TrendingUp} tone="success" />
          <KpiCard label="Total Fuel Cost (MTD)" value="$24,950" delta={-2.1} hint="vs target budget" icon={Fuel} tone="warning" />
          <KpiCard label="Fleet ROI" value="18.5%" delta={4.2} hint="Annualized return" icon={DollarSign} tone="primary" />
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
                    <span className="font-semibold text-muted-foreground">${exp.amount.toLocaleString()}</span>
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

  // 3. Default Fleet Manager / Admin view
  return (
    <>
      <PageHeader
        title="Fleet Overview"
        description="Real-time snapshot of your operations."
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <>
            {canExport && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            )}
            {canNewTrip && (
              <Button size="sm" onClick={() => navigate({ to: "/trips" })}>
                <Plus className="h-4 w-4" /> New Trip
              </Button>
            )}
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
          {tripsList.filter((t) => t.status === "Dispatched" || t.status === "in-progress").length ? (
            tripsList.filter((t) => t.status === "Dispatched" || t.status === "in-progress").map((t) => (
              <div key={t.id} className="rounded-lg border p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="font-semibold text-sm truncate">{t.origin} → {t.destination}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.driver} · {t.vehicle} · {t.distance} km</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-3 text-center py-6">No active trips</p>
          )}
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
