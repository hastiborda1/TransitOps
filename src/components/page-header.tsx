import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";

export type Crumb = { label: string; to?: string };

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs: Crumb[] =
    breadcrumbs ??
    pathname
      .split("/")
      .filter(Boolean)
      .map((seg, i, arr) => ({
        label: seg.charAt(0).toUpperCase() + seg.slice(1),
        to: "/" + arr.slice(0, i + 1).join("/"),
      }));

  return (
    <div className="mb-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Link to="/dashboard" className="inline-flex items-center gap-1 hover:text-primary">
          <Home className="h-3.5 w-3.5" />
        </Link>
        {crumbs.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {c.to && i < crumbs.length - 1 ? (
              <Link to={c.to} className="hover:text-primary">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
