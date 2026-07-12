import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Fuel } from "lucide-react";
import { api } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import type { FuelLog } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/fuel")({
  head: () => ({ meta: [{ title: "Fuel Logs — TransitOps" }, { name: "description", content: "Track fuel consumption, cost and efficiency." }] }),
  component: FuelPage,
});

function FuelPage() {
  const { data, isLoading } = useQuery({ queryKey: ["fuel"], queryFn: api.fuel.list });

  const columns: Column<FuelLog>[] = [
    { key: "id", header: "Log", sortable: true, sortValue: (r) => r.id, accessor: (r) => <span className="text-sm font-mono">{r.id}</span> },
    { key: "date", header: "Date", sortable: true, sortValue: (r) => r.date, accessor: (r) => <span className="text-sm">{r.date}</span> },
    { key: "vehicle", header: "Vehicle", accessor: (r) => <span className="text-sm font-medium">{r.vehicle}</span> },
    { key: "driver", header: "Driver", accessor: (r) => <span className="text-sm">{r.driver}</span> },
    { key: "station", header: "Station", accessor: (r) => <span className="text-sm text-muted-foreground">{r.station}</span> },
    { key: "liters", header: "Liters", sortable: true, sortValue: (r) => r.liters, accessor: (r) => <span className="text-sm tabular-nums">{r.liters} L</span> },
    { key: "cost", header: "Cost", sortable: true, sortValue: (r) => r.cost, accessor: (r) => <span className="text-sm tabular-nums font-medium">${r.cost.toFixed(2)}</span> },
    { key: "odometer", header: "Odometer", accessor: (r) => <span className="text-sm tabular-nums text-muted-foreground">{r.odometer.toLocaleString()}</span> },
  ];

  return (
    <>
      <PageHeader title="Fuel Logs" description="Every refill across your fleet."
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Log Refill</Button>} />
      <DataTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        searchKeys={["id", "vehicle", "driver", "station"]}
        emptyIcon={<Fuel className="h-8 w-8 mx-auto" />}
        emptyTitle="No fuel logs"
        emptyDescription="Record a refill to start tracking consumption."
      />
    </>
  );
}
