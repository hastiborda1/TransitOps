import { createFileRoute } from "@tanstack/react-router";
import { 
  User, Truck, MapPin, Gauge, Droplets, Map, CheckCircle2,
  Clock, AlertCircle, FileText, ChevronRight, Activity, Calendar
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/driver")({
  head: () => ({
    meta: [
      { title: "Driver Portal — TransitOps" },
    ],
  }),
  component: DriverDashboardPage,
});

// Mock Data
const DRIVER_PROFILE = {
  name: "Marcus Johnson",
  employeeId: "DRV-8942",
  license: "TX-CDL-998213",
  vehicle: "Freightliner Cascadia (TX-3391)",
  status: "On Trip",
  safetyScore: 98,
};

const CURRENT_TRIP = {
  id: "TRP-9021",
  source: "Dallas Fulfillment Center",
  destination: "Austin Distribution Hub",
  vehicle: "TX-3391",
  cargo: "Electronics (12,500 lbs)",
  distance: "195 miles",
  eta: "2h 15m",
  status: "On Route",
};

const VEHICLE_INFO = {
  name: "Freightliner Cascadia",
  registration: "TX-3391",
  type: "Heavy Duty Tractor",
  fuelType: "Diesel",
  odometer: "142,500 km",
  status: "Active",
};

const ASSIGNED_TRIPS = [
  { id: "TRP-9025", source: "Austin Hub", destination: "Houston Port", vehicle: "TX-3391", distance: "165 miles", status: "Dispatched" },
  { id: "TRP-9033", source: "Houston Port", destination: "San Antonio Depot", vehicle: "TX-3391", distance: "197 miles", status: "Draft" },
];

const TRIP_HISTORY = [
  { id: "TRP-8992", distance: "240 miles", fuel: "38 gal", date: "2026-07-10", status: "Completed" },
  { id: "TRP-8951", distance: "310 miles", fuel: "48 gal", date: "2026-07-08", status: "Completed" },
  { id: "TRP-8910", distance: "155 miles", fuel: "24 gal", date: "2026-07-05", status: "Completed" },
];

function DriverDashboardPage() {
  const handleAction = (msg: string) => toast.success(msg);
  const handleFormSubmit = (e: React.FormEvent, msg: string) => {
    e.preventDefault();
    toast.success(msg);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${DRIVER_PROFILE.name}`}
        description={new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        breadcrumbs={[{ label: "Driver Portal" }]}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => handleAction("Trip Started")}><MapPin className="w-4 h-4 mr-2" /> Start Trip</Button>
            <Button variant="outline" onClick={() => handleAction("Fuel form focused")}><Droplets className="w-4 h-4 mr-2" /> Log Fuel</Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 1. Driver Profile & 4. Vehicle Information */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{DRIVER_PROFILE.name}</h3>
                <p className="text-sm text-muted-foreground">{DRIVER_PROFILE.employeeId}</p>
                <div className="mt-1">
                  <Badge variant="default">{DRIVER_PROFILE.status}</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">License Number</span>
                <span className="font-medium">{DRIVER_PROFILE.license}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Safety Score</span>
                <span className="font-medium text-green-600">{DRIVER_PROFILE.safetyScore}/100</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Assigned Vehicle</span>
                <span className="font-medium">{DRIVER_PROFILE.vehicle}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><Truck className="w-4 h-4" /> Vehicle Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Make & Model</span>
                <span className="font-medium">{VEHICLE_INFO.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Registration</span>
                <span className="font-medium">{VEHICLE_INFO.registration}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Type & Fuel</span>
                <span className="font-medium">{VEHICLE_INFO.type} ({VEHICLE_INFO.fuelType})</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Current Odometer</span>
                <span className="font-medium">{VEHICLE_INFO.odometer}</span>
              </div>
            </div>
          </Card>

          {/* 10. Notifications */}
          <Card className="p-5 bg-amber-500/10 border-amber-500/20">
            <h3 className="font-semibold text-amber-700 flex items-center gap-2 mb-3"><AlertCircle className="w-4 h-4" /> Action Required</h3>
            <ul className="space-y-3 text-sm text-amber-800">
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" /> Maintenance reminder: 500 miles until next oil change.</li>
              <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" /> Fuel entry pending for trip TRP-8992.</li>
            </ul>
          </Card>
        </div>

        {/* 2. Current Trip, 3. Trip Timeline, 12. Route Map Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Active Trip</Badge>
                  <span className="font-mono text-sm text-muted-foreground">{CURRENT_TRIP.id}</span>
                </div>
                <h2 className="text-xl font-bold">{CURRENT_TRIP.source} → {CURRENT_TRIP.destination}</h2>
              </div>
              <Button size="lg" className="w-full sm:w-auto" onClick={() => handleAction("Trip Marked as Completed")}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Trip
              </Button>
            </div>

            {/* 3. Trip Timeline */}
            <div className="mb-8 mt-2 px-2">
              <div className="flex justify-between relative">
                <div className="absolute top-3 left-0 w-full h-1 bg-muted -z-10 rounded-full"></div>
                <div className="absolute top-3 left-0 w-2/3 h-1 bg-primary -z-10 rounded-full"></div>
                
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs"><CheckCircle2 className="w-3 h-3" /></div>
                  <span className="text-xs font-medium">Draft</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs"><CheckCircle2 className="w-3 h-3" /></div>
                  <span className="text-xs font-medium">Dispatched</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shadow-[0_0_0_4px_var(--color-primary-20)]">3</div>
                  <span className="text-xs font-bold text-primary">On Route</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">4</div>
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs mb-1">Cargo</p>
                <p className="font-semibold">{CURRENT_TRIP.cargo}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs mb-1">Distance</p>
                <p className="font-semibold">{CURRENT_TRIP.distance}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs mb-1">ETA</p>
                <p className="font-semibold">{CURRENT_TRIP.eta}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs mb-1">Vehicle</p>
                <p className="font-semibold">{CURRENT_TRIP.vehicle}</p>
              </div>
            </div>

            {/* 12. Route Map */}
            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed text-muted-foreground">
              <Map className="w-12 h-12 mb-2 opacity-50" />
              <p className="font-medium">Live Route Map Visualization</p>
              <p className="text-xs">GPS integration pending</p>
            </div>
          </Card>
        </div>
      </div>

      {/* 9. Driver Performance KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <KpiCard label="Completed Trips" value={142} hint="Lifetime" icon={CheckCircle2} tone="success" />
        <KpiCard label="Avg Fuel Efficiency" value="6.8 mpg" hint="Last 30 days" icon={Droplets} tone="primary" />
        <KpiCard label="Safety Score" value="98/100" hint="Top 5% of fleet" icon={Activity} tone="success" />
        <KpiCard label="Total Distance" value="48,200 mi" hint="Lifetime" icon={MapPin} tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* 5. Odometer & 6. Fuel Forms */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Log Operations Data</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <form onSubmit={(e) => handleFormSubmit(e, "Odometer Updated Successfully")} className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm flex items-center gap-2"><Gauge className="w-4 h-4"/> Update Odometer</h4>
                <p className="text-xs text-muted-foreground">Current: {VEHICLE_INFO.odometer}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="odo">New Reading (km)</Label>
                <Input id="odo" type="number" placeholder="142550" required />
              </div>
              <Button type="submit" className="w-full">Update Reading</Button>
            </form>

            <form onSubmit={(e) => handleFormSubmit(e, "Fuel Log Saved Successfully")} className="space-y-4 border-t sm:border-t-0 sm:border-l sm:pl-6 pt-4 sm:pt-0">
              <div className="space-y-1">
                <h4 className="font-medium text-sm flex items-center gap-2"><Droplets className="w-4 h-4"/> Add Fuel Log</h4>
                <p className="text-xs text-muted-foreground">Attach receipt for reimbursement</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity (gal)</Label>
                  <Input id="qty" type="number" step="0.1" placeholder="0.0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Total Cost ($)</Label>
                  <Input id="cost" type="number" step="0.01" placeholder="0.00" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="station">Station Name</Label>
                <Input id="station" type="text" placeholder="e.g. Pilot Travel Center" required />
              </div>
              <div className="p-4 border-2 border-dashed rounded text-center text-xs text-muted-foreground cursor-pointer hover:bg-muted/50">
                <FileText className="w-4 h-4 mx-auto mb-1 opacity-50" />
                Upload Receipt Placeholder
              </div>
              <Button type="submit" variant="secondary" className="w-full">Save Fuel Log</Button>
            </form>
          </div>
        </Card>

        {/* 7. Assigned Trips & 8. History */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">My Trips</h3>
            <Button variant="ghost" size="sm">View All <ChevronRight className="w-4 h-4 ml-1"/></Button>
          </div>
          
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Upcoming / Assigned</h4>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ASSIGNED_TRIPS.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="text-sm">{t.source} → {t.destination}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent History</h4>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TRIP_HISTORY.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="text-sm">{t.date}</TableCell>
                      <TableCell className="text-sm">{t.distance}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
