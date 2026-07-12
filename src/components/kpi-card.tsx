import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KpiCardProps = {
  label: string;
  value: string | number;
  delta?: number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
};

const toneBg: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 [color:oklch(0.45_0.15_75)]",
  info: "bg-info/12 text-info",
};

export function KpiCard({ label, value, delta, hint, icon: Icon, tone = "primary" }: KpiCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight truncate">{value}</p>
          {(delta !== undefined || hint) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {delta !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-semibold",
                    up ? "text-success" : "text-destructive",
                  )}
                >
                  {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {Math.abs(delta)}%
                </span>
              )}
              {hint && <span className="text-muted-foreground truncate">{hint}</span>}
            </div>
          )}
        </div>
        <div className={cn("shrink-0 grid place-items-center h-10 w-10 rounded-lg", toneBg[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
