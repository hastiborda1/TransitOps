import { createFileRoute } from "@tanstack/react-router";
import { 
  Users, Shield, Truck, Route as RouteIcon, AlertTriangle, 
  Activity, Server, Database, Lock, HardDrive, 
  Settings, UserPlus, Key, CheckCircle2, 
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  Area, AreaChart, Pie, PieChart, Cell, 
  CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend 
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — TransitOps" },
    ],
  }),
  component: AdminDashboardPage,
});

// Mock Data
const MOCK_USERS = [
  { id: "U001", name: "Alice Johnson", email: "alice@transitops.com", role: "Administrator", status: "Active", lastLogin: "2026-07-12 08:30" },
  { id: "U002", name: "Bob Smith", email: "bob@transitops.com", role: "Fleet Manager", status: "Active", lastLogin: "2026-07-12 09:15" },
  { id: "U003", name: "Carol White", email: "carol@transitops.com", role: "Safety Officer", status: "Inactive", lastLogin: "2026-07-10 14:20" },
  { id: "U004", name: "David Brown", email: "david@transitops.com", role: "Financial Analyst", status: "Active", lastLogin: "2026-07-11 11:45" },
  { id: "U005", name: "Eve Davis", email: "eve@transitops.com", role: "Driver", status: "Suspended", lastLogin: "2026-07-05 16:00" },
];

const MOCK_ROLES = [
  { name: "Administrator", users: 3, active: 3, permissions: "Full System Access" },
  { name: "Fleet Manager", users: 12, active: 11, permissions: "Vehicles, Dispatch, Drivers" },
  { name: "Safety Officer", users: 4, active: 4, permissions: "Compliance, Safety Scores" },
  { name: "Financial Analyst", users: 5, active: 5, permissions: "Expenses, ROI, Reporting" },
  { name: "Driver", users: 145, active: 138, permissions: "Trips, Fuel Logs, Odometer" },
];

const ACTIVITY_LOG = [
  { time: "10 mins ago", user: "Bob Smith", action: "Trip Created", target: "TRP-8921", status: "success" },
  { time: "1 hour ago", user: "Alice Johnson", action: "Role Updated", target: "Carol White -> Safety Officer", status: "info" },
  { time: "2 hours ago", user: "Eve Davis", action: "Maintenance Started", target: "TX-4421", status: "warning" },
  { time: "3 hours ago", user: "System", action: "Vehicle Registered", target: "TX-9982", status: "success" },
];

const UTILIZATION_DATA = [
  { month: "Jan", utilization: 78 },
  { month: "Feb", utilization: 82 },
  { month: "Mar", utilization: 85 },
  { month: "Apr", utilization: 81 },
  { month: "May", utilization: 88 },
  { month: "Jun", utilization: 92 },
];

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const ROLE_DISTRIBUTION = [
  { name: "Drivers", value: 145 },
  { name: "Fleet Managers", value: 12 },
  { name: "Analysts", value: 5 },
  { name: "Safety", value: 4 },
  { name: "Admins", value: 3 },
];

function AdminDashboardPage() {
  const handleAction = (msg: string) => toast.success(msg);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Administration"
        description="Comprehensive platform management and monitoring."
        breadcrumbs={[{ label: "Admin" }]}
        actions={
          <div className="flex gap-2">
            <Input placeholder="Global Search..." className="w-64 bg-background" />
            <Button onClick={() => handleAction("Settings opened")}><Settings className="w-4 h-4 mr-2" /> Global Settings</Button>
          </div>
        }
      />

      {/* 1. KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <KpiCard label="Total Users" value={169} hint="Active: 161" icon={Users} tone="primary" />
        <KpiCard label="Fleet Utilization" value="92%" hint="Peak performance" icon={RouteIcon} tone="success" />
        <KpiCard label="System Health" value="99.9%" hint="All services operational" icon={Activity} tone="success" />
        <KpiCard label="Suspended Drivers" value={3} hint="Requires review" icon={AlertTriangle} tone="destructive" />
        <KpiCard label="Pending Maintenance" value={8} hint="Scheduled this week" icon={Truck} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* 2. User Management */}
        <Card className="lg:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">User Management</h3>
              <p className="text-sm text-muted-foreground">Manage platform access and roles.</p>
            </div>
            <Button size="sm" onClick={() => handleAction("Add User dialog opened")}><UserPlus className="w-4 h-4 mr-2" /> Add User</Button>
          </div>
          <div className="border rounded-md flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_USERS.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Inactive' ? 'secondary' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleAction(`Edit ${user.name}`)}><Settings className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAction(`Reset password for ${user.name}`)}><Key className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* 5. System Health */}
        <Card className="p-5 flex flex-col gap-4">
          <div>
            <h3 className="font-semibold mb-1">System Health</h3>
            <p className="text-sm text-muted-foreground">Live infrastructure monitoring.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><Server className="w-4 h-4 text-blue-500"/> API Status</span>
                <span className="text-green-500 font-medium">Online</span>
              </div>
              <Progress value={100} className="h-2 bg-muted" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><Database className="w-4 h-4 text-purple-500"/> Database</span>
                <span className="text-green-500 font-medium">32ms Latency</span>
              </div>
              <Progress value={85} className="h-2 bg-muted" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-amber-500"/> Auth Service</span>
                <span className="text-green-500 font-medium">99.99% Uptime</span>
              </div>
              <Progress value={99} className="h-2 bg-muted" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-emerald-500"/> Storage</span>
                <span className="text-muted-foreground">64% Used (1.2TB)</span>
              </div>
              <Progress value={64} className="h-2 bg-muted" />
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t text-xs text-muted-foreground flex justify-between">
            <span>Server Load: 24%</span>
            <span>Last Backup: 10 mins ago</span>
          </div>
        </Card>
      </div>

      {/* 3. Role Management */}
      <div>
        <h3 className="font-semibold mb-4">Role Management</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          {MOCK_ROLES.map((role) => (
            <Card key={role.name} className="p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-medium text-sm">{role.name}</h4>
                <p className="text-2xl font-bold mt-1">{role.users}</p>
                <p className="text-xs text-muted-foreground">Users ({role.active} Active)</p>
                <p className="text-xs mt-3 bg-muted p-2 rounded truncate" title={role.permissions}>{role.permissions}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleAction(`Edit ${role.name}`)}>Edit</Button>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleAction(`Assign ${role.name}`)}>Assign</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 7. Analytics & 4. Fleet Overview */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Role Distribution Analytics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ROLE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {ROLE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Platform Growth & Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={UTILIZATION_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Area type="monotone" dataKey="utilization" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 6. Recent Activity */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold mb-4">System Activity Log</h3>
          <div className="space-y-4">
            {ACTIVITY_LOG.map((log, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className={`p-2 rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-600' : log.status === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                  {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : log.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{log.action}</p>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">{log.user}</span> • {log.target}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 8. Notifications & 9. Quick Actions */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Critical Alerts</h3>
            <div className="space-y-3">
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">3 Expired Licenses</p>
                  <p className="text-xs opacity-80 mt-1">Drivers require immediate renewal verification.</p>
                </div>
              </div>
              <div className="bg-amber-500/10 text-amber-600 p-3 rounded-md flex items-start gap-3">
                <Truck className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">8 Vehicles Due Maintenance</p>
                  <p className="text-xs opacity-80 mt-1">Schedule service to avoid breakdowns.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleAction("Opened Roles")}><Shield className="w-5 h-5"/> Roles</Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleAction("Opened Registry")}><Truck className="w-5 h-5"/> Registry</Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleAction("Generated Report")}><PieChartIcon className="w-5 h-5"/> Reports</Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleAction("View Analytics")}><Activity className="w-5 h-5"/> Analytics</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
