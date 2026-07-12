import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Receipt } from "lucide-react";
import { api } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({ meta: [{ title: "Expenses — TransitOps" }, { name: "description", content: "Track and approve operational fleet expenses." }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["expenses"], queryFn: api.expenses.list });

  const columns: Column<Expense>[] = [
    { key: "id", header: "ID", sortable: true, sortValue: (r) => r.id, accessor: (r) => <span className="text-sm font-mono">{r.id}</span> },
    { key: "date", header: "Date", sortable: true, sortValue: (r) => r.date, accessor: (r) => <span className="text-sm">{r.date}</span> },
    { key: "category", header: "Category", accessor: (r) => (
      <span className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">{r.category}</span>
    ) },
    { key: "description", header: "Description", accessor: (r) => <span className="text-sm">{r.description}</span> },
    { key: "vehicle", header: "Vehicle", accessor: (r) => <span className="text-sm text-muted-foreground">{r.vehicle ?? "—"}</span> },
    { key: "amount", header: "Amount", sortable: true, sortValue: (r) => r.amount, accessor: (r) => <span className="text-sm tabular-nums font-semibold">${r.amount.toLocaleString()}</span>, className: "text-right" },
    { key: "status", header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <PageHeader title="Expenses" description="Approvals and financial visibility across operations."
        actions={<Button size="sm"><Plus className="h-4 w-4" /> New Expense</Button>} />
      <DataTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        searchKeys={["id", "description", "category", "vehicle"]}
        emptyIcon={<Receipt className="h-8 w-8 mx-auto" />}
        emptyTitle="No expenses"
        emptyDescription="Log an expense to start tracking spend."
      />
    </>
  );
}
