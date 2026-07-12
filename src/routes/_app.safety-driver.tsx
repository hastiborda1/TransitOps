import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, AlertTriangle, Calendar, ArrowLeft, CheckCircle2, UserX } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/safety-driver")({
  component: SafetyDriverPage,
});

const mockDrivers = [
  { id: 1, name: "James Carter", license: "CDL-A", category: "Heavy Truck", expiry: "2027-12-31", score: 96, status: "Compliant" },
  { id: 2, name: "Priya Shah", license: "CDL-A", category: "Heavy Truck", expiry: "2027-12-31", score: 98, status: "Compliant" },
  { id: 3, name: "Mia Nguyen", license: "CDL-B", category: "Light Truck", expiry: "2027-12-31", score: 94, status: "Compliant" },
  { id: 4, name: "Daniel Ochieng", license: "CDL-A", category: "Heavy Truck", expiry: "2027-12-31", score: 92, status: "Compliant" },
  { id: 5, name: "Sofia Rossi", license: "CDL-B", category: "Light Truck", expiry: "2027-12-31", score: 98, status: "Compliant" },
  { id: 6, name: "Ahmed Al-Farsi", license: "CDL-A", category: "Heavy Truck", expiry: "2027-12-31", score: 90, status: "Compliant" },
  { id: 7, name: "Lena Müller", license: "CDL-A", category: "Heavy Truck", expiry: "2024-01-01", score: 78, status: "Expired & Suspended" },
];

function SafetyDriverPage() {
  const expiredDrivers = mockDrivers.filter(d => new Date(d.expiry) < new Date());
  const avgScore = Math.round(mockDrivers.reduce((acc, d) => acc + d.score, 0) / mockDrivers.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Safety Driver & Compliance Portal</h1>
          <p className="text-muted-foreground text-sm">Monitor driver compliance status, license expirations, and safety ratings.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Average Safety Rating" value={`${avgScore}%`} delta={1.2} hint="Target >= 85%" icon={Shield} tone="success" />
        <KpiCard label="Compliant Drivers" value={`${mockDrivers.length - expiredDrivers.length}`} delta={0} hint="All clear" icon={CheckCircle2} tone="primary" />
        <KpiCard label="Critical Alerts" value={`${expiredDrivers.length}`} delta={0} hint="Expired / Suspended" icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 gold-stripe-left">
          <h3 className="text-lg font-semibold mb-4">Driver Registry & Safety Scores</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="py-3">Driver Name</th>
                  <th className="py-3">License Category</th>
                  <th className="py-3">Expiry Date</th>
                  <th className="py-3">Safety Score</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockDrivers.map((d) => {
                  const isExp = new Date(d.expiry) < new Date();
                  return (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3.5 font-medium">{d.name}</td>
                      <td className="py-3.5 text-muted-foreground">{d.category}</td>
                      <td className="py-3.5">
                        <span className={isExp ? "text-destructive font-semibold" : ""}>{d.expiry}</span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full ${d.score >= 90 ? "bg-green-500" : d.score >= 80 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${d.score}%` }} />
                          </div>
                          <span className="font-semibold">{d.score}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${isExp ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Safety Infractions
            </h3>
            <ul className="space-y-4">
              {expiredDrivers.map(d => (
                <li key={d.id} className="flex gap-3 items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                  <UserX className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-red-900">{d.name}</h4>
                    <p className="text-xs text-red-700">License expired on {d.expiry}. Access to vehicle operations is suspended.</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Compliance Standards
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between border-b pb-2">
                <span>Minimum Rating Target</span>
                <span className="font-semibold text-foreground">85%</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span>License Verification Frequency</span>
                <span className="font-semibold text-foreground">Quarterly</span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span>Active Operating Permits</span>
                <span className="font-semibold text-foreground">6 / 7 Verified</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
