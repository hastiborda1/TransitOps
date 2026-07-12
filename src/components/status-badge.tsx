import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "info" | "destructive" | "muted" | "primary";

const toneMap: Record<string, Tone> = {
  // Legacy
  active: "success",
  available: "success",
  completed: "success",
  approved: "success",
  "in-progress": "info",
  "on-trip": "info",
  scheduled: "info",
  pending: "warning",
  maintenance: "warning",
  idle: "muted",
  "off-duty": "muted",
  cancelled: "muted",
  overdue: "destructive",
  rejected: "destructive",
  suspended: "destructive",
  retired: "muted",

  // Aligned Specifics
  Available: "success",
  "On Trip": "info",
  "In Shop": "warning",
  Retired: "muted",
  Draft: "info",
  Dispatched: "info",
  Completed: "success",
  Cancelled: "muted",
  "Off Duty": "muted",
  Suspended: "destructive",
};

const toneStyles: Record<Tone, string> = {
  success: "bg-success/12 text-success ring-success/20",
  warning: "bg-warning/15 text-warning-foreground ring-warning/25 [color:oklch(0.45_0.15_75)]",
  info: "bg-info/12 text-info ring-info/20",
  destructive: "bg-destructive/12 text-destructive ring-destructive/20",
  muted: "bg-muted text-muted-foreground ring-border",
  primary: "bg-primary/10 text-primary ring-primary/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = toneMap[status] ?? "muted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
        toneStyles[tone],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-success": tone === "success",
        "bg-[oklch(0.75_0.15_75)]": tone === "warning",
        "bg-info": tone === "info",
        "bg-destructive": tone === "destructive",
        "bg-muted-foreground": tone === "muted",
        "bg-primary": tone === "primary",
      })} />
      {status.replace(/-/g, " ")}
    </span>
  );
}
