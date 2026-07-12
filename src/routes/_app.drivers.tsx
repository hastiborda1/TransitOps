import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Star, Users } from "lucide-react";
import { api } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Driver } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/drivers")({
  head: () => ({ meta: [{ title: "Drivers — TransitOps" }, { name: "description", content: "Manage driver profiles, status and performance." }] }),
  component: DriversPage,
});

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function DriversPage() {
  const { data, isLoading } = useQuery({ queryKey: ["drivers"], queryFn: api.drivers.list });

  const columns: Column<Driver>[] = [
    {
      key: "name", header: "Driver", sortable: true, sortValue: (r) => r.name,
      accessor: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials(r.name)}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{r.name}</p>
            <p className="text-xs text-muted-foreground truncate">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", accessor: (r) => <span className="text-sm">{r.phone}</span> },
    { key: "license", header: "License", accessor: (r) => <span className="text-sm">{r.license}</span> },
    { key: "vehicle", header: "Vehicle", accessor: (r) => <span className="text-sm">{r.vehicle ?? "—"}</span> },
    { key: "trips", header: "Trips", sortable: true, sortValue: (r) => r.trips, accessor: (r) => <span className="text-sm tabular-nums">{r.trips}</span> },
    { key: "rating", header: "Rating", sortable: true, sortValue: (r) => r.rating, accessor: (r) => (
      <span className="inline-flex items-center gap-1 text-sm tabular-nums"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {r.rating.toFixed(1)}</span>
    ) },
    { key: "status", header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader title="Drivers" description="Team members licensed to operate your fleet."
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Add Driver</Button>} />
      <DataTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        searchKeys={["name", "email", "license", "vehicle"]}
        emptyIcon={<Users className="h-8 w-8 mx-auto" />}
        emptyTitle="No drivers"
        emptyDescription="Add drivers to assign them to vehicles."
      />
    </>
  );
}
