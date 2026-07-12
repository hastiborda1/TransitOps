import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Route as RouteIcon, MapPin } from "lucide-react";
import { api } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/trips")({
  head: () => ({ meta: [{ title: "Trips — TransitOps" }, { name: "description", content: "All fleet trips: scheduled, in-progress and completed." }] }),
  component: TripsPage,
});

function TripsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["trips"], queryFn: api.trips.list });

  const columns: Column<Trip>[] = [
    { key: "id", header: "Trip", sortable: true, sortValue: (r) => r.id, accessor: (r) => <span className="text-sm font-mono">{r.id}</span> },
    {
      key: "route", header: "Route",
      accessor: (r) => (
        <div className="min-w-0">
          <p className="text-sm font-medium truncate flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {r.origin}</p>
          <p className="text-xs text-muted-foreground truncate pl-4">→ {r.destination}</p>
        </div>
      ),
    },
    { key: "driver", header: "Driver", accessor: (r) => <span className="text-sm">{r.driver}</span> },
    { key: "vehicle", header: "Vehicle", accessor: (r) => <span className="text-sm">{r.vehicle}</span> },
    { key: "distance", header: "Distance", sortable: true, sortValue: (r) => r.distance, accessor: (r) => <span className="text-sm tabular-nums">{r.distance} km</span> },
    { key: "startedAt", header: "Start", sortable: true, sortValue: (r) => r.startedAt, accessor: (r) => <span className="text-sm text-muted-foreground">{r.startedAt}</span> },
    { key: "status", header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader title="Trips" description="Track journeys from dispatch to delivery."
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Schedule Trip</Button>} />
      <DataTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        searchKeys={["id", "origin", "destination", "driver", "vehicle"]}
        emptyIcon={<RouteIcon className="h-8 w-8 mx-auto" />}
        emptyTitle="No trips"
        emptyDescription="Schedule a trip to see it appear here."
      />
    </>
  );
}
