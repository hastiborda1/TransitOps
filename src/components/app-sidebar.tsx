import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route as RouteIcon,
  Wrench,
  Fuel,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { authService } from "@/services/api";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Vehicles", url: "/vehicles", icon: Truck },
  { title: "Drivers", url: "/drivers", icon: Users },
  { title: "Trips", url: "/trips", icon: RouteIcon },
] as const;

const opsNav = [
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Fuel Logs", url: "/fuel", icon: Fuel },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Safety Driver", url: "/safety-driver", icon: Shield },
  { title: "Financial Analyst", url: "/financial-analyst", icon: TrendingUp },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
] as const;

const bottomNav = [{ title: "Settings", url: "/settings", icon: Settings }] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const user = authService.getCurrentUser() || { role: "fleet-manager" };
  const role = user.role;

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await authService.logout();
    navigate({ to: "/login" });
  };

  const hasAccess = (url: string, userRole: string): boolean => {
    const permissions: Record<string, string[]> = {
      '/admin': ['admin'],
      '/dashboard': ['fleet-manager'],
      '/safety-driver': ['safety-officer'],
      '/financial-analyst': ['financial-analyst'],
      '/driver': ['driver'],
      '/vehicles': ['fleet-manager'],
      '/trips': ['fleet-manager'],
      '/drivers': ['fleet-manager'],
      '/maintenance': ['fleet-manager'],
      '/fuel': ['fleet-manager'],
      '/expenses': ['fleet-manager', 'financial-analyst'],
      '/analytics': ['fleet-manager', 'financial-analyst'],
      '/settings': ['fleet-manager', 'admin'],
    };
    
    const match = Object.entries(permissions).find(([route]) => 
      url === route || url.startsWith(route + '/')
    );
    if (match) {
      return match[1].includes(userRole);
    }
    return true;
  };

  const filteredMainNav = mainNav
    .map((item) => {
      if (item.title === "Dashboard" && role === "driver") {
        return { ...item, url: "/driver" as any };
      }
      return item;
    })
    .filter((item) => hasAccess(item.url, role));

  const filteredOpsNav = opsNav.filter((item) => hasAccess(item.url, role));

  const finalOpsNav = [...filteredOpsNav];
  if (role === "admin" && hasAccess("/admin", role)) {
    // Add System admin dashboard for administrative role
    finalOpsNav.push({ title: "System Admin", url: "/admin" as any, icon: Shield });
  }

  const filteredBottomNav = bottomNav.filter((item) => hasAccess(item.url, role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary shadow-sm shadow-primary/25">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">TransitOps</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fleet Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {finalOpsNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {filteredBottomNav.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign out" onClick={() => {
              logout();
              window.location.href = "/login";
            }}>
              <div className="flex items-center gap-2 cursor-pointer w-full text-left">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

