import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Star, Users, Loader2, Download } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { Driver } from "@/lib/mock-data";
import { exportToCsv } from "@/lib/utils";

export const Route = createFileRoute("/_app/drivers")({
  head: () => ({
    meta: [
      { title: "Drivers — TransitOps" },
      { name: "description", content: "Manage driver profiles, status and performance." },
    ],
  }),
  component: DriversPage,
});

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const driverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(5, "Enter a valid phone number"),
  license: z.string().min(2, "License is required"),
  licenseCategory: z.string().min(1, "License Category is required"),
  licenseExpiry: z.string().min(10, "Valid expiration date is required"),
  status: z.enum(["Available", "On Trip", "Off Duty", "Suspended"]),
});

type DriverFormValues = z.infer<typeof driverSchema>;

function DriversPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: api.drivers.list,
  });

  const createMutation = useMutation({
    mutationFn: api.drivers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver registered successfully");
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register driver");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      license: "",
      licenseCategory: "Heavy Truck",
      licenseExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
        .toISOString()
        .substring(0, 10),
      status: "Available",
    },
  });

  const watchStatus = watch("status");

  const onSubmit = (values: DriverFormValues) => {
    createMutation.mutate({
      ...values,
      rating: 5.0,
      trips: 0,
    });
  };

  const handleExport = () => {
    if (!data) return;
    const headers = ["Driver Name", "Email", "Phone", "License", "License Category", "License Expiry", "Status", "Rating", "Completed Trips"];
    const rows = data.map((d: any) => [
      d.name,
      d.email,
      d.phone,
      d.license,
      d.licenseCategory ?? "Light Truck",
      d.licenseExpiry ?? "2027-12-31",
      d.status,
      d.rating,
      d.trips,
    ]);
    exportToCsv("TransitOps_Drivers_Registry", headers, rows);
  };

  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: "Driver",
      sortable: true,
      sortValue: (r) => r.name,
      accessor: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials(r.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{r.name}</p>
            <p className="text-xs text-muted-foreground truncate">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      accessor: (r) => <span className="text-sm">{r.phone}</span>,
    },
    {
      key: "license",
      header: "License",
      accessor: (r) => <span className="text-sm">{r.license}</span>,
    },
    {
      key: "licenseCategory",
      header: "License Category",
      accessor: (r: any) => <span className="text-sm">{r.licenseCategory ?? "Light Truck"}</span>,
    },
    {
      key: "licenseExpiry",
      header: "License Expiry",
      accessor: (r: any) => (
        <span className="text-sm">
          {r.licenseExpiry ? new Date(r.licenseExpiry).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      accessor: (r) => <span className="text-sm">{r.vehicle ?? "—"}</span>,
    },
    {
      key: "trips",
      header: "Trips",
      sortable: true,
      sortValue: (r) => r.trips,
      accessor: (r) => (
        <span className="text-sm tabular-nums">{r.trips}</span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      sortValue: (r) => r.rating,
      accessor: (r) => (
        <span className="inline-flex items-center gap-1 text-sm tabular-nums">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {r.rating.toFixed(1)}
        </span>
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
        title="Drivers"
        description="Team members licensed to operate your fleet."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport} className="mr-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add Driver
            </Button>
          </>
        }
      />
      <DataTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        searchKeys={["name", "email", "license", "vehicle"]}
        emptyIcon={<Users className="h-8 w-8 mx-auto" />}
        emptyTitle="No drivers"
        emptyDescription="Add drivers to assign them to vehicles."
      />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Register New Driver</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="e.g. John Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="e.g. john@company.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" placeholder="e.g. +1 555-0199" {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="license">License Number *</Label>
                <Input id="license" placeholder="e.g. CDL-A-1234" {...register("license")} />
                {errors.license && <p className="text-xs text-destructive">{errors.license.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="licenseCategory">License Category *</Label>
                <Input id="licenseCategory" placeholder="e.g. Heavy Truck" {...register("licenseCategory")} />
                {errors.licenseCategory && (
                  <p className="text-xs text-destructive">{errors.licenseCategory.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="licenseExpiry">License Expiry *</Label>
                <Input id="licenseExpiry" type="date" {...register("licenseExpiry")} />
                {errors.licenseExpiry && (
                  <p className="text-xs text-destructive">{errors.licenseExpiry.message}</p>
                )}
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
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
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
