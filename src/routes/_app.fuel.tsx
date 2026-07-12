import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Fuel, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { api } from "@/services/api";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
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
import type { FuelLog } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/fuel")({
  head: () => ({
    meta: [
      { title: "Fuel Logs — TransitOps" },
      { name: "description", content: "Track fuel consumption, cost and efficiency." },
    ],
  }),
  component: FuelPage,
});

const fuelSchema = z.object({
  vehicle: z.string().min(1, "Select a vehicle"),
  driver: z.string().min(1, "Select a driver"),
  date: z.string().min(10, "Valid date is required"),
  liters: z.coerce.number().min(1, "Liters must be positive"),
  cost: z.coerce.number().min(0.01, "Cost must be positive"),
  odometer: z.coerce.number().min(0, "Odometer cannot be negative"),
  station: z.string().min(2, "Station name is required"),
});

type FuelFormValues = z.infer<typeof fuelSchema>;

function FuelPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: logs, isLoading: isLogsLoading } = useQuery({
    queryKey: ["fuel"],
    queryFn: api.fuel.list,
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: api.vehicles.list,
  });

  const { data: drivers } = useQuery({
    queryKey: ["drivers"],
    queryFn: api.drivers.list,
  });

  const createMutation = useMutation({
    mutationFn: api.fuel.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Fuel log added successfully");
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add fuel log");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FuelFormValues>({
    resolver: zodResolver(fuelSchema),
    defaultValues: {
      vehicle: "",
      driver: "",
      date: new Date().toISOString().substring(0, 10),
      liters: 50,
      cost: 80,
      odometer: 100000,
      station: "",
    },
  });

  const watchVehicle = watch("vehicle");
  const watchDriver = watch("driver");

  const onSubmit = (values: FuelFormValues) => {
    createMutation.mutate(values);
  };

  const columns: Column<FuelLog>[] = [
    {
      key: "id",
      header: "Log",
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
      key: "vehicle",
      header: "Vehicle",
      accessor: (r) => <span className="text-sm font-medium">{r.vehicle}</span>,
    },
    {
      key: "driver",
      header: "Driver",
      accessor: (r) => <span className="text-sm">{r.driver}</span>,
    },
    {
      key: "station",
      header: "Station",
      accessor: (r) => <span className="text-sm text-muted-foreground">{r.station}</span>,
    },
    {
      key: "liters",
      header: "Liters",
      sortable: true,
      sortValue: (r) => r.liters,
      accessor: (r) => <span className="text-sm tabular-nums">{r.liters} L</span>,
    },
    {
      key: "cost",
      header: "Cost",
      sortable: true,
      sortValue: (r) => r.cost,
      accessor: (r) => (
        <span className="text-sm tabular-nums font-medium">${r.cost.toFixed(2)}</span>
      ),
    },
    {
      key: "odometer",
      header: "Odometer",
      accessor: (r) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {r.odometer.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Fuel Logs"
        description="Every refill across your fleet."
        actions={
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" /> Log Refill
          </Button>
        }
      />
      <DataTable
        data={logs ?? []}
        columns={columns}
        isLoading={isLogsLoading}
        searchKeys={["id", "vehicle", "driver", "station"]}
        emptyIcon={<Fuel className="h-8 w-8 mx-auto" />}
        emptyTitle="No fuel logs"
        emptyDescription="Record a refill to start tracking consumption."
      />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Log Fuel Refill</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="vehicle">Select Vehicle *</Label>
                <Select value={watchVehicle} onValueChange={(v) => setValue("vehicle", v)}>
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles?.map((v) => (
                      <SelectItem key={v.id} value={v.plate}>
                        {v.plate} ({v.make} {v.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicle && <p className="text-xs text-destructive">{errors.vehicle.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="driver">Select Driver *</Label>
                <Select value={watchDriver} onValueChange={(v) => setValue("driver", v)}>
                  <SelectTrigger id="driver">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers?.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.driver && <p className="text-xs text-destructive">{errors.driver.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Refill Date *</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="station">Fuel Station *</Label>
                <Input id="station" placeholder="e.g. Shell #221" {...register("station")} />
                {errors.station && <p className="text-xs text-destructive">{errors.station.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="liters">Liters *</Label>
                <Input id="liters" type="number" step="0.01" {...register("liters")} />
                {errors.liters && <p className="text-xs text-destructive">{errors.liters.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cost">Total Cost ($) *</Label>
                <Input id="cost" type="number" step="0.01" {...register("cost")} />
                {errors.cost && <p className="text-xs text-destructive">{errors.cost.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="odometer">Odometer (km) *</Label>
                <Input id="odometer" type="number" {...register("odometer")} />
                {errors.odometer && <p className="text-xs text-destructive">{errors.odometer.message}</p>}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log Refill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
