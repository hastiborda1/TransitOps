import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Wrench, Loader2, CheckCircle } from "lucide-react";
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
import type { Maintenance } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance — TransitOps" },
      { name: "description", content: "Scheduled and completed maintenance for your fleet." },
    ],
  }),
  component: MaintenancePage,
});

const maintenanceSchema = z.object({
  vehicle: z.string().min(1, "Select a vehicle"),
  type: z.string().min(2, "Service type is required"),
  workshop: z.string().min(2, "Workshop name is required"),
  dueDate: z.string().min(10, "Valid date is required"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  status: z.enum(["scheduled", "in-progress", "overdue", "completed"]),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

function MaintenancePage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: tickets, isLoading: isTicketsLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: api.maintenance.list,
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: api.vehicles.list,
  });

  const createMutation = useMutation({
    mutationFn: api.maintenance.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Maintenance ticket created successfully");
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create ticket");
    },
  });

  const completeMutation = useMutation({
    mutationFn: api.maintenance.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Maintenance ticket completed");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to complete ticket");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicle: "",
      type: "",
      workshop: "",
      dueDate: new Date().toISOString().substring(0, 10),
      cost: 150,
      status: "in-progress",
    },
  });

  const watchVehicle = watch("vehicle");
  const watchStatus = watch("status");

  const onSubmit = (values: MaintenanceFormValues) => {
    createMutation.mutate(values);
  };

  const handleComplete = (id: string) => {
    completeMutation.mutate({ id });
  };

  const columns: Column<Maintenance>[] = [
    {
      key: "id",
      header: "Ticket",
      sortable: true,
      sortValue: (r) => r.id,
      accessor: (r) => <span className="text-sm font-mono">{r.id}</span>,
    },
    {
      key: "vehicle",
      header: "Vehicle",
      accessor: (r) => <span className="text-sm font-medium">{r.vehicle}</span>,
    },
    {
      key: "type",
      header: "Service",
      accessor: (r) => <span className="text-sm">{r.type}</span>,
    },
    {
      key: "workshop",
      header: "Workshop",
      accessor: (r) => <span className="text-sm text-muted-foreground">{r.workshop}</span>,
    },
    {
      key: "dueDate",
      header: "Due",
      sortable: true,
      sortValue: (r) => r.dueDate,
      accessor: (r) => <span className="text-sm">{r.dueDate}</span>,
    },
    {
      key: "cost",
      header: "Cost",
      sortable: true,
      sortValue: (r) => r.cost,
      accessor: (r) => <span className="text-sm tabular-nums">${r.cost.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (r) => {
        if (r.status !== "completed") {
          return (
            <Button size="xs" onClick={() => handleComplete(r.id)} disabled={completeMutation.isPending}>
              <CheckCircle className="h-3 w-3 mr-1" /> Close Ticket
            </Button>
          );
        }
        return <span className="text-xs text-muted-foreground">—</span>;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Keep every vehicle roadworthy and compliant."
        actions={
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" /> New Ticket
          </Button>
        }
      />
      <DataTable
        data={tickets ?? []}
        columns={columns}
        isLoading={isTicketsLoading}
        searchKeys={["id", "vehicle", "type", "workshop"]}
        emptyIcon={<Wrench className="h-8 w-8 mx-auto" />}
        emptyTitle="No maintenance"
        emptyDescription="Schedule maintenance tickets to see them here."
      />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Log Maintenance Ticket</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="vehicle">Select Vehicle *</Label>
              <Select value={watchVehicle} onValueChange={(v) => setValue("vehicle", v)}>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.map((v) => (
                    <SelectItem key={v.id} value={v.plate}>
                      {v.plate} ({v.make} {v.model}) — {v.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicle && <p className="text-xs text-destructive">{errors.vehicle.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">Service Type / Description *</Label>
              <Input id="type" placeholder="e.g. Engine tune-up, Brake pads" {...register("type")} />
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="workshop">Workshop Name *</Label>
              <Input id="workshop" placeholder="e.g. QuickTire Center" {...register("workshop")} />
              {errors.workshop && (
                <p className="text-xs text-destructive">{errors.workshop.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dueDate">Scheduled / Due Date *</Label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
                {errors.dueDate && (
                  <p className="text-xs text-destructive">{errors.dueDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cost">Estimated Cost ($) *</Label>
                <Input id="cost" type="number" {...register("cost")} />
                {errors.cost && <p className="text-xs text-destructive">{errors.cost.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Initial Ticket Status *</Label>
              <Select value={watchStatus} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress (In Shop)</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
