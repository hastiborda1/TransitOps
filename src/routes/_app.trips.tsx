import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Route as RouteIcon, MapPin, Loader2, Play, CheckCircle, XCircle } from "lucide-react";
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
import type { Trip } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/trips")({
  head: () => ({
    meta: [
      { title: "Trips — TransitOps" },
      { name: "description", content: "All fleet trips: scheduled, in-progress and completed." },
    ],
  }),
  component: TripsPage,
});

const tripSchema = z.object({
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  vehiclePlate: z.string().min(1, "Select a vehicle"),
  driverName: z.string().min(1, "Select a driver"),
  distance: z.coerce.number().min(1, "Distance must be positive"),
  cargoWeight: z.coerce.number().min(1, "Cargo weight must be positive"),
});

const completionSchema = z.object({
  actualDistance: z.coerce.number().min(0, "Distance must be positive"),
  fuelConsumed: z.coerce.number().min(0, "Fuel consumed must be positive"),
});

type TripFormValues = z.infer<typeof tripSchema>;
type CompletionFormValues = z.infer<typeof completionSchema>;

function TripsPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const { data: trips, isLoading: isTripsLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: api.trips.list,
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: api.vehicles.list,
  });

  const { data: drivers } = useQuery({
    queryKey: ["drivers"],
    queryFn: api.drivers.list,
  });

  // Filter available drivers & vehicles
  const availableVehicles = vehicles?.filter((v) => v.status === "idle") ?? [];
  const availableDrivers = drivers?.filter((d) => d.status === "available") ?? [];

  const createMutation = useMutation({
    mutationFn: api.trips.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Trip scheduled successfully");
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to schedule trip");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: api.trips.updateStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      toast.success(`Trip status updated to: ${variables.status}`);
      setIsCompleteOpen(false);
      setActiveTripId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update trip status");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      origin: "",
      destination: "",
      vehiclePlate: "",
      driverName: "",
      distance: 100,
      cargoWeight: 500,
    },
  });

  const {
    register: registerComplete,
    handleSubmit: handleSubmitComplete,
    setValue: setCompleteValue,
    formState: { errors: completeErrors },
  } = useForm<CompletionFormValues>({
    resolver: zodResolver(completionSchema),
    defaultValues: {
      actualDistance: 100,
      fuelConsumed: 20,
    },
  });

  const watchVehicle = watch("vehiclePlate");
  const watchDriver = watch("driverName");

  const onSubmit = (values: TripFormValues) => {
    createMutation.mutate(values);
  };

  const onCompleteSubmit = (values: CompletionFormValues) => {
    if (!activeTripId) return;
    updateStatusMutation.mutate({
      tripId: activeTripId,
      status: "completed",
      actualDistance: values.actualDistance,
      fuelConsumed: values.fuelConsumed,
    });
  };

  const handleDispatch = (tripId: string) => {
    updateStatusMutation.mutate({
      tripId,
      status: "in-progress",
    });
  };

  const handleCancel = (tripId: string) => {
    updateStatusMutation.mutate({
      tripId,
      status: "cancelled",
    });
  };

  const openCompleteModal = (trip: Trip) => {
    setActiveTripId(trip.id);
    setCompleteValue("actualDistance", trip.distance);
    setCompleteValue("fuelConsumed", Math.round(trip.distance * 0.25)); // default estimate
    setIsCompleteOpen(true);
  };

  const columns: Column<Trip>[] = [
    {
      key: "id",
      header: "Trip",
      sortable: true,
      sortValue: (r) => r.id,
      accessor: (r) => <span className="text-sm font-mono">{r.id}</span>,
    },
    {
      key: "route",
      header: "Route",
      accessor: (r) => (
        <div className="min-w-0">
          <p className="text-sm font-medium truncate flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" /> {r.origin}
          </p>
          <p className="text-xs text-muted-foreground truncate pl-4">→ {r.destination}</p>
        </div>
      ),
    },
    {
      key: "driver",
      header: "Driver",
      accessor: (r) => <span className="text-sm">{r.driver}</span>,
    },
    {
      key: "vehicle",
      header: "Vehicle",
      accessor: (r) => <span className="text-sm">{r.vehicle}</span>,
    },
    {
      key: "distance",
      header: "Distance",
      sortable: true,
      sortValue: (r) => r.distance,
      accessor: (r) => <span className="text-sm tabular-nums">{r.distance} km</span>,
    },
    {
      key: "startedAt",
      header: "Start",
      sortable: true,
      sortValue: (r) => r.startedAt,
      accessor: (r) => <span className="text-sm text-muted-foreground">{r.startedAt}</span>,
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
        if (r.status === "scheduled") {
          return (
            <div className="flex gap-2">
              <Button size="xs" onClick={() => handleDispatch(r.id)}>
                <Play className="h-3 w-3 mr-1" /> Dispatch
              </Button>
              <Button size="xs" variant="outline" onClick={() => handleCancel(r.id)}>
                <XCircle className="h-3 w-3 mr-1 text-destructive" /> Cancel
              </Button>
            </div>
          );
        }
        if (r.status === "in-progress") {
          return (
            <div className="flex gap-2">
              <Button size="xs" variant="success" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => openCompleteModal(r)}>
                <CheckCircle className="h-3 w-3 mr-1" /> Complete
              </Button>
              <Button size="xs" variant="outline" onClick={() => handleCancel(r.id)}>
                <XCircle className="h-3 w-3 mr-1 text-destructive" /> Cancel
              </Button>
            </div>
          );
        }
        return <span className="text-xs text-muted-foreground">—</span>;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Trips"
        description="Track journeys from dispatch to delivery."
        actions={
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" /> Schedule Trip
          </Button>
        }
      />
      <DataTable
        data={trips ?? []}
        columns={columns}
        isLoading={isTripsLoading}
        searchKeys={["id", "origin", "destination", "driver", "vehicle"]}
        emptyIcon={<RouteIcon className="h-8 w-8 mx-auto" />}
        emptyTitle="No trips"
        emptyDescription="Schedule a trip to see it appear here."
      />

      {/* Schedule Trip Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Schedule New Trip</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="origin">Origin *</Label>
              <Input id="origin" placeholder="e.g. Portland, OR" {...register("origin")} />
              {errors.origin && <p className="text-xs text-destructive">{errors.origin.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="destination">Destination *</Label>
              <Input id="destination" placeholder="e.g. Seattle, WA" {...register("destination")} />
              {errors.destination && (
                <p className="text-xs text-destructive">{errors.destination.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="distance">Planned Distance (km) *</Label>
                <Input id="distance" type="number" {...register("distance")} />
                {errors.distance && (
                  <p className="text-xs text-destructive">{errors.distance.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cargoWeight">Cargo Weight (kg) *</Label>
                <Input id="cargoWeight" type="number" {...register("cargoWeight")} />
                {errors.cargoWeight && (
                  <p className="text-xs text-destructive">{errors.cargoWeight.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="vehiclePlate">Available Vehicle *</Label>
                <Select
                  value={watchVehicle}
                  onValueChange={(v) => setValue("vehiclePlate", v)}
                >
                  <SelectTrigger id="vehiclePlate">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.plate}>
                        {v.plate} ({v.make} {v.model})
                      </SelectItem>
                    ))}
                    {availableVehicles.length === 0 && (
                      <SelectItem value="none" disabled>
                        No available vehicles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.vehiclePlate && (
                  <p className="text-xs text-destructive">{errors.vehiclePlate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="driverName">Available Driver *</Label>
                <Select
                  value={watchDriver}
                  onValueChange={(v) => setValue("driverName", v)}
                >
                  <SelectTrigger id="driverName">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name} ({d.license})
                      </SelectItem>
                    ))}
                    {availableDrivers.length === 0 && (
                      <SelectItem value="none" disabled>
                        No available drivers
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.driverName && (
                  <p className="text-xs text-destructive">{errors.driverName.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complete Trip Dialog */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Trip</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitComplete(onCompleteSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="actualDistance">Actual Distance (km) *</Label>
              <Input id="actualDistance" type="number" {...registerComplete("actualDistance")} />
              {completeErrors.actualDistance && (
                <p className="text-xs text-destructive">{completeErrors.actualDistance.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fuelConsumed">Fuel Consumed (Liters) *</Label>
              <Input id="fuelConsumed" type="number" {...registerComplete("fuelConsumed")} />
              {completeErrors.fuelConsumed && (
                <p className="text-xs text-destructive">{completeErrors.fuelConsumed.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCompleteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
