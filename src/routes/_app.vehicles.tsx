import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Truck, Filter, Loader2, Download } from "lucide-react";
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
import type { Vehicle } from "@/lib/mock-data";
import { exportToCsv } from "@/lib/utils";

export const Route = createFileRoute("/_app/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehicles — TransitOps" },
      { name: "description", content: "Manage your fleet of vehicles." },
    ],
  }),
  component: VehiclesPage,
});

const vehicleSchema = z.object({
  plate: z.string().min(3, "Plate number must be at least 3 characters"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  type: z.enum(["Truck", "Van", "Car", "Bus"]),
  status: z.enum(["Available", "On Trip", "In Shop", "Retired"]),
  odometer: z.coerce.number().min(0, "Odometer cannot be negative"),
  fuelType: z.enum(["Diesel", "Petrol", "Electric", "Hybrid"]),
  maxLoad: z.coerce.number().min(1, "Maximum capacity is required"),
  acquisitionCost: z.coerce.number().min(0, "Acquisition cost cannot be negative"),
  driver: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

function VehiclesPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: api.vehicles.list,
  });

  const createMutation = useMutation({
    mutationFn: api.vehicles.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle registered successfully");
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register vehicle");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      type: "Truck",
      status: "Available",
      odometer: 0,
      fuelType: "Diesel",
      maxLoad: 5000,
      acquisitionCost: 40000,
      driver: "",
    },
  });

  const watchType = watch("type");
  const watchStatus = watch("status");
  const watchFuel = watch("fuelType");

  const onSubmit = (values: VehicleFormValues) => {
    createMutation.mutate(values);
  };

  const handleExport = () => {
    if (!Array.isArray(data)) return;
    const headers = ["Vehicle Plate", "Make", "Model", "Year", "Type", "Status", "Odometer (km)", "Fuel Type", "Max Load (kg)", "Acquisition Cost ($)"];
    const rows = data.map((v: any) => [
      v.plate,
      v.make,
      v.model,
      v.year,
      v.type,
      v.status,
      v.odometer,
      v.fuelType,
      v.maxLoad ?? 1000,
      v.acquisitionCost ?? 20000,
    ]);
    exportToCsv("TransitOps_Vehicles_Registry", headers, rows);
  };

  const columns: Column<Vehicle>[] = [
    {
      key: "plate",
      header: "Vehicle",
      sortable: true,
      sortValue: (r) => r.plate,
      accessor: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Truck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{r.plate}</p>
            <p className="text-xs text-muted-foreground truncate">
              {r.make} {r.model} · {r.year}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      sortValue: (r) => r.type,
      accessor: (r) => <span className="text-sm">{r.type}</span>,
    },
    {
      key: "driver",
      header: "Driver",
      accessor: (r) => <span className="text-sm">{r.driver ?? "—"}</span>,
    },
    {
      key: "maxLoad",
      header: "Max Load",
      accessor: (r: any) => <span className="text-sm">{(r.maxLoad ?? 1000).toLocaleString()} kg</span>,
    },
    {
      key: "odometer",
      header: "Odometer",
      sortable: true,
      sortValue: (r) => r.odometer,
      accessor: (r) => (
        <span className="text-sm tabular-nums">{r.odometer.toLocaleString()} km</span>
      ),
    },
    {
      key: "fuelType",
      header: "Fuel",
      accessor: (r) => <span className="text-sm">{r.fuelType}</span>,
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
        title="Vehicles"
        description="All vehicles across your fleet."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </>
        }
      />

      <DataTable
        data={Array.isArray(data) ? data : []}
        columns={columns}
        isLoading={isLoading}
        searchKeys={["plate", "make", "model", "driver"]}
        emptyIcon={<Truck className="h-8 w-8 mx-auto" />}
        emptyTitle="No vehicles yet"
        emptyDescription="Add your first vehicle to start tracking."
      />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register New Vehicle</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="plate">Plate Number *</Label>
                <Input id="plate" placeholder="e.g. TX-9821" {...register("plate")} />
                {errors.plate && <p className="text-xs text-destructive">{errors.plate.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">Vehicle Type *</Label>
                <Select
                  value={watchType}
                  onValueChange={(v) => setValue("type", v as any)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="make">Make *</Label>
                <Input id="make" placeholder="e.g. Volvo" {...register("make")} />
                {errors.make && <p className="text-xs text-destructive">{errors.make.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="model">Model *</Label>
                <Input id="model" placeholder="e.g. FH16" {...register("model")} />
                {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="year">Year *</Label>
                <Input id="year" type="number" {...register("year")} />
                {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fuelType">Fuel Type *</Label>
                <Select
                  value={watchFuel}
                  onValueChange={(v) => setValue("fuelType", v as any)}
                >
                  <SelectTrigger id="fuelType">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="maxLoad">Max Load Capacity (kg) *</Label>
                <Input id="maxLoad" type="number" {...register("maxLoad")} />
                {errors.maxLoad && <p className="text-xs text-destructive">{errors.maxLoad.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="acquisitionCost">Acquisition Cost ($) *</Label>
                <Input id="acquisitionCost" type="number" {...register("acquisitionCost")} />
                {errors.acquisitionCost && <p className="text-xs text-destructive">{errors.acquisitionCost.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="odometer">Odometer (km) *</Label>
                <Input id="odometer" type="number" {...register("odometer")} />
                {errors.odometer && <p className="text-xs text-destructive">{errors.odometer.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={watchStatus}
                  onValueChange={(v) => setValue("status", v as any)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="On Trip">On Trip</SelectItem>
                    <SelectItem value="In Shop">In Shop</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
