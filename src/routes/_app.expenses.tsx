import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { api } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Expense } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — TransitOps" },
      { name: "description", content: "Track and approve operational fleet expenses." },
    ],
  }),
  component: ExpensesPage,
});

const expenseSchema = z.object({
  date: z.string().min(10, "Valid date is required"),
  category: z.enum(["Fuel", "Maintenance", "Insurance", "Tolls", "Salary", "Other"]),
  vehicle: z.string().optional(),
  description: z.string().min(2, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be positive"),
  status: z.enum(["approved", "pending", "rejected"]),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

function ExpensesPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: expenses, isLoading: isExpensesLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: api.expenses.list,
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: api.vehicles.list,
  });

  const createMutation = useMutation({
    mutationFn: api.expenses.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense logged successfully");
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to log expense");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().substring(0, 10),
      category: "Other",
      vehicle: "",
      description: "",
      amount: 10,
      status: "approved",
    },
  });

  const watchCategory = watch("category");
  const watchVehicle = watch("vehicle");
  const watchStatus = watch("status");

  const onSubmit = (values: ExpenseFormValues) => {
    createMutation.mutate({
      ...values,
      vehicle: values.vehicle === "none" || !values.vehicle ? undefined : values.vehicle,
    });
  };

  const columns: Column<Expense>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sortValue: (r) => r.id,
      accessor: (r) => <span className="text-sm font-mono">{r.id}</span>,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (r) => r.date,
      accessor: (r) => <span className="text-sm">{r.date}</span>,
    },
    {
      key: "category",
      header: "Category",
      accessor: (r) => (
        <span className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
          {r.category}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      accessor: (r) => <span className="text-sm">{r.description}</span>,
    },
    {
      key: "vehicle",
      header: "Vehicle",
      accessor: (r) => <span className="text-sm text-muted-foreground">{r.vehicle ?? "—"}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      sortValue: (r) => r.amount,
      accessor: (r) => (
        <span className="text-sm tabular-nums font-semibold">${r.amount.toLocaleString()}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Approvals and financial visibility across operations."
        actions={
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" /> New Expense
          </Button>
        }
      />
      <DataTable
        data={expenses ?? []}
        columns={columns}
        isLoading={isExpensesLoading}
        searchKeys={["id", "description", "category", "vehicle"]}
        emptyIcon={<Receipt className="h-8 w-8 mx-auto" />}
        emptyTitle="No expenses"
        emptyDescription="Log an expense to start tracking spend."
      />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Log Operational Expense</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Select value={watchCategory} onValueChange={(v) => setValue("category", v as any)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fuel">Fuel</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Tolls">Tolls</SelectItem>
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description / Notes *</Label>
              <Input id="description" placeholder="e.g. Annual registration fee" {...register("description")} />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input id="amount" type="number" step="0.01" {...register("amount")} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status *</Label>
                <Select value={watchStatus} onValueChange={(v) => setValue("status", v as any)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vehicle">Associated Vehicle (Optional)</Label>
              <Select value={watchVehicle} onValueChange={(v) => setValue("vehicle", v)}>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="No vehicle associated" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {vehicles?.map((v) => (
                    <SelectItem key={v.id} value={v.plate}>
                      {v.plate} ({v.make} {v.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
