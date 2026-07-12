import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";

<<<<<<< HEAD
const roleLabels: Record<string, string> = {
  manager: "Fleet Manager",
  driver: "Driver",
  safety: "Safety Officer",
  finance: "Financial Analyst",
  "fleet-manager": "Fleet Manager",
  "safety-officer": "Safety Officer",
  "financial-analyst": "Financial Analyst",
  admin: "System Administrator",
};

export function TopBar() {
  const { getSession } = useAuth();
  const session = getSession();
  const user = session || { name: "Alex Morgan", role: "manager" };

  const name = user.name || "Alex Morgan";
  const role = roleLabels[user.role] || user.role || "Fleet Manager";

=======
const ROLE_TITLES: Record<string, string> = {
  "fleet-manager": "Fleet Manager",
  "driver": "Driver",
  "safety-officer": "Safety Officer",
  "financial-analyst": "Financial Analyst",
  "admin": "System Administrator",
  "manager": "Fleet Manager",
  "safety": "Safety Officer",
  "finance": "Financial Analyst",
};

export function TopBar() {
  const { getSession } = useAuth();
  const user = getSession();
  
  const name = user?.name || user?.email?.split("@")[0] || "Alex Morgan";
  const role = user?.role ? (ROLE_TITLES[user.role] || user.role) : "Fleet Manager";

>>>>>>> main
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 h-14 bg-background/85 backdrop-blur border-b flex items-center gap-3 px-3 sm:px-6">
      <SidebarTrigger className="shrink-0" />
      <Separator orientation="vertical" className="h-6 hidden sm:block" />
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search vehicles, drivers, trips…" className="pl-12 h-9 bg-surface-container-low border-transparent focus-visible:bg-background" />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
        <div className="hidden sm:flex items-center gap-2 pl-2">
          <div className="text-right leading-tight">
            <p className="text-xs font-semibold">{name}</p>
            <p className="text-[10px] text-muted-foreground">{role}</p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
