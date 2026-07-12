import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Truck, Filter } from "lucide-react";
import { api } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/vehicles")({
  head: () => ({ meta: [{ title: "Vehicles — TransitOps" }, { name: "description", content: "Manage your fleet of vehicles." }] }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["vehicles"], queryFn: api.vehicles.list });

  const columns: Column<Vehicle>[] = [
    {
      key: "plate", header: "Vehicle", sortable: true, sortValue: (r) => r.plate,
      accessor: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Truck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{r.plate}</p>
            <p className="text-xs text-muted-foreground truncate">{r.make} {r.model} · {r.year}</p>
          </div>
        </div>
      ),
    },
    { key: "type", header: "Type", sortable: true, sortValue: (r) => r.type, accessor: (r) => <span className="text-sm">{r.type}</span> },
    { key: "driver", header: "Driver", accessor: (r) => <span className="text-sm">{r.driver ?? "—"}</span> },
    { key: "odometer", header: "Odometer", sortable: true, sortValue: (r) => r.odometer, accessor: (r) => <span className="text-sm tabular-nums">{r.odometer.toLocaleString()} km</span> },
    { key: "fuelType", header: "Fuel", accessor: (r) => <span className="text-sm">{r.fuelType}</span> },
    { key: "status", header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="All vehicles across your fleet."
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> Filters</Button>
            <Button size="sm"><Plus className="h-4 w-4" /> Add Vehicle</Button>
          </>
        }
      />
      <DataTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        searchKeys={["plate", "make", "model", "driver"]}
        emptyIcon={<Truck className="h-8 w-8 mx-auto" />}
        emptyTitle="No vehicles yet"
        emptyDescription="Add your first vehicle to start tracking."
      />
    </>
  );
}
