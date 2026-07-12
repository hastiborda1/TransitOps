import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Wrench } from "lucide-react";
import { api } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import type { Maintenance } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — TransitOps" }, { name: "description", content: "Scheduled and completed maintenance for your fleet." }] }),
  component: MaintenancePage,
});

function MaintenancePage() {
  const { data, isLoading } = useQuery({ queryKey: ["maintenance"], queryFn: api.maintenance.list });

  const columns: Column<Maintenance>[] = [
    { key: "id", header: "Ticket", sortable: true, sortValue: (r) => r.id, accessor: (r) => <span className="text-sm font-mono">{r.id}</span> },
    { key: "vehicle", header: "Vehicle", accessor: (r) => <span className="text-sm font-medium">{r.vehicle}</span> },
    { key: "type", header: "Service", accessor: (r) => <span className="text-sm">{r.type}</span> },
    { key: "workshop", header: "Workshop", accessor: (r) => <span className="text-sm text-muted-foreground">{r.workshop}</span> },
    { key: "dueDate", header: "Due", sortable: true, sortValue: (r) => r.dueDate, accessor: (r) => <span className="text-sm">{r.dueDate}</span> },
    { key: "cost", header: "Cost", sortable: true, sortValue: (r) => r.cost, accessor: (r) => <span className="text-sm tabular-nums">${r.cost.toLocaleString()}</span> },
    { key: "status", header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader title="Maintenance" description="Keep every vehicle roadworthy and compliant."
        actions={<Button size="sm"><Plus className="h-4 w-4" /> New Ticket</Button>} />
      <DataTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        searchKeys={["id", "vehicle", "type", "workshop"]}
        emptyIcon={<Wrench className="h-8 w-8 mx-auto" />}
        emptyTitle="No maintenance"
        emptyDescription="Schedule maintenance tickets to see them here."
      />
    </>
  );
}
