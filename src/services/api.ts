import { createServerFn } from "@tanstack/react-start";
import { query, fallbackDb, isUsingFallback } from "@/lib/db";
import type {
  Vehicle,
  Driver,
  Trip,
  Maintenance,
  FuelLog,
  Expense,
} from "@/lib/mock-data";

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

// DB row to Model mappers
function mapVehicle(row: any): Vehicle & { maxLoad?: number; acquisitionCost?: number } {
  return {
    id: row.id,
    plate: row.plate,
    make: row.make,
    model: row.model,
    year: parseInt(row.year),
    type: row.type,
    status: row.status,
    odometer: parseInt(row.odometer),
    fuelType: row.fuel_type,
    driver: row.driver || undefined,
    maxLoad: row.max_load ? parseInt(row.max_load) : undefined,
    acquisitionCost: row.acquisition_cost ? parseInt(row.acquisition_cost) : undefined,
  };
}

function mapDriver(row: any): Driver & { licenseCategory?: string; licenseExpiry?: string } {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    license: row.license,
    status: row.status,
    rating: parseFloat(row.rating),
    trips: parseInt(row.trips),
    vehicle: row.vehicle || undefined,
    licenseCategory: row.license_category || undefined,
    licenseExpiry: row.license_expiry || undefined,
  };
}

function mapTrip(row: any): Trip & { cargoWeight?: number; plannedDistance?: number } {
  return {
    id: row.id,
    vehicle: row.vehicle,
    driver: row.driver,
    origin: row.origin,
    destination: row.destination,
    distance: parseInt(row.distance),
    startedAt: row.started_at,
    status: row.status,
    cargoWeight: row.cargo_weight ? parseInt(row.cargo_weight) : undefined,
    plannedDistance: row.planned_distance ? parseInt(row.planned_distance) : undefined,
  };
}

function mapMaintenance(row: any): Maintenance {
  return {
    id: row.id,
    vehicle: row.vehicle,
    type: row.type,
    dueDate: row.due_date,
    cost: parseInt(row.cost),
    status: row.status,
    workshop: row.workshop,
  };
}

function mapFuelLog(row: any): FuelLog {
  return {
    id: row.id,
    vehicle: row.vehicle,
    driver: row.driver,
    date: row.date,
    liters: parseFloat(row.liters),
    cost: parseFloat(row.cost),
    odometer: parseInt(row.odometer),
    station: row.station,
  };
}

function mapExpense(row: any): Expense {
  return {
    id: row.id,
    date: row.date,
    category: row.category,
    vehicle: row.vehicle || undefined,
    description: row.description,
    amount: parseFloat(row.amount),
    status: row.status,
  };
}

// ----------------------------------------------------
// SERVER FUNCTIONS
// ----------------------------------------------------

const getVehiclesList = createServerFn("GET", async () => {
  if (isUsingFallback()) {
    return fallbackDb.vehicles;
  }
  const rows = await query("SELECT * FROM vehicles ORDER BY id DESC");
  return rows.map(mapVehicle);
});

const getDriversList = createServerFn("GET", async () => {
  if (isUsingFallback()) {
    return fallbackDb.drivers;
  }
  const rows = await query("SELECT * FROM drivers ORDER BY id DESC");
  return rows.map(mapDriver);
});

const getTripsList = createServerFn("GET", async () => {
  if (isUsingFallback()) {
    return fallbackDb.trips;
  }
  const rows = await query("SELECT * FROM trips ORDER BY id DESC");
  return rows.map(mapTrip);
});

const getMaintenanceList = createServerFn("GET", async () => {
  if (isUsingFallback()) {
    return fallbackDb.maintenance;
  }
  const rows = await query("SELECT * FROM maintenance ORDER BY id DESC");
  return rows.map(mapMaintenance);
});

const getFuelList = createServerFn("GET", async () => {
  if (isUsingFallback()) {
    return fallbackDb.fuelLogs;
  }
  const rows = await query("SELECT * FROM fuel_logs ORDER BY id DESC");
  return rows.map(mapFuelLog);
});

const getExpensesList = createServerFn("GET", async () => {
  if (isUsingFallback()) {
    return fallbackDb.expenses;
  }
  const rows = await query("SELECT * FROM expenses ORDER BY id DESC");
  return rows.map(mapExpense);
});

// Create operations
const createVehicleFn = createServerFn("POST", async (data: Omit<Vehicle & { maxLoad: number; acquisitionCost: number }, "id">) => {
  const id = generateId("V");
  if (isUsingFallback()) {
    const newVehicle = { id, ...data };
    fallbackDb.vehicles.unshift(newVehicle);
    return newVehicle;
  }
  await query(
    "INSERT INTO vehicles (id, plate, make, model, year, type, status, odometer, fuel_type, driver, max_load, acquisition_cost) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
    [id, data.plate, data.make, data.model, data.year, data.type, data.status, data.odometer, data.fuelType, data.driver || null, data.maxLoad, data.acquisitionCost]
  );
  return { id, ...data };
});

const createDriverFn = createServerFn("POST", async (data: Omit<Driver & { licenseCategory: string; licenseExpiry: string }, "id">) => {
  const id = generateId("D");
  if (isUsingFallback()) {
    const newDriver = { id, ...data };
    fallbackDb.drivers.unshift(newDriver);
    return newDriver;
  }
  await query(
    "INSERT INTO drivers (id, name, email, phone, license, status, rating, trips, vehicle, license_category, license_expiry) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
    [id, data.name, data.email, data.phone, data.license, data.status, data.rating, data.trips, data.vehicle || null, data.licenseCategory, data.licenseExpiry]
  );
  return { id, ...data };
});

// Trip creation and lifecycle (dispatch, complete, cancel)
const createTripFn = createServerFn("POST", async (data: {
  origin: string;
  destination: string;
  vehiclePlate: string;
  driverName: string;
  distance: number;
  cargoWeight: number;
}) => {
  const id = generateId("T");
  const startedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  // Business logic validation
  // 1. Get vehicle & check capacity + status
  let vehicleObj: any = null;
  if (isUsingFallback()) {
    vehicleObj = fallbackDb.vehicles.find(v => v.plate === data.vehiclePlate);
  } else {
    const rows = await query("SELECT * FROM vehicles WHERE plate = $1", [data.vehiclePlate]);
    if (rows.length > 0) vehicleObj = mapVehicle(rows[0]);
  }

  if (!vehicleObj) throw new Error("Vehicle not found");
  if (vehicleObj.status === "maintenance" || vehicleObj.status === "retired") {
    throw new Error("Vehicle is not available (in shop or retired)");
  }
  if (vehicleObj.status === "active") { // active in mock data translates to on-trip/busy
    throw new Error("Vehicle is already marked On Trip");
  }
  if (data.cargoWeight > (vehicleObj.maxLoad ?? 1000)) {
    throw new Error(`Cargo weight exceeds vehicle's maximum load capacity of ${vehicleObj.maxLoad ?? 1000} kg`);
  }

  // 2. Get driver & check license + status
  let driverObj: any = null;
  if (isUsingFallback()) {
    driverObj = fallbackDb.drivers.find(d => d.name === data.driverName);
  } else {
    const rows = await query("SELECT * FROM drivers WHERE name = $1", [data.driverName]);
    if (rows.length > 0) driverObj = mapDriver(rows[0]);
  }

  if (!driverObj) throw new Error("Driver not found");
  if (driverObj.status === "suspended") {
    throw new Error("Driver has a suspended status");
  }
  if (driverObj.status === "on-trip") {
    throw new Error("Driver is already assigned to an active trip");
  }
  if (driverObj.licenseExpiry && new Date(driverObj.licenseExpiry) < new Date()) {
    throw new Error("Driver's license is expired");
  }

  // Save trip
  if (isUsingFallback()) {
    const newTrip: Trip & { cargoWeight: number; plannedDistance: number } = {
      id,
      vehicle: data.vehiclePlate,
      driver: data.driverName,
      origin: data.origin,
      destination: data.destination,
      distance: data.distance,
      startedAt,
      status: "scheduled",
      cargoWeight: data.cargoWeight,
      plannedDistance: data.distance,
    };
    fallbackDb.trips.unshift(newTrip);
    return newTrip;
  }

  await query(
    "INSERT INTO trips (id, vehicle, driver, origin, destination, distance, started_at, status, cargo_weight, planned_distance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    [id, data.vehiclePlate, data.driverName, data.origin, data.destination, data.distance, startedAt, "scheduled", data.cargoWeight, data.distance]
  );
  return { id, vehicle: data.vehiclePlate, driver: data.driverName, origin: data.origin, destination: data.destination, distance: data.distance, startedAt, status: "scheduled" };
});

const updateTripStatusFn = createServerFn("POST", async (data: {
  tripId: string;
  status: "in-progress" | "completed" | "cancelled";
  actualDistance?: number;
  fuelConsumed?: number;
}) => {
  // Fetch trip
  let trip: any = null;
  if (isUsingFallback()) {
    trip = fallbackDb.trips.find(t => t.id === data.tripId);
  } else {
    const rows = await query("SELECT * FROM trips WHERE id = $1", [data.tripId]);
    if (rows.length > 0) trip = mapTrip(rows[0]);
  }
  if (!trip) throw new Error("Trip not found");

  const prevStatus = trip.status;
  trip.status = data.status;

  if (isUsingFallback()) {
    // 1. Dispatching a trip automatically changes both vehicle and driver status to active / on-trip
    if (data.status === "in-progress") {
      const v = fallbackDb.vehicles.find(x => x.plate === trip.vehicle);
      if (v) v.status = "active"; // active means On Trip
      const d = fallbackDb.drivers.find(x => x.name === trip.driver);
      if (d) d.status = "on-trip";
    }
    // 2. Completing or cancelling restores statuses
    else if (data.status === "completed") {
      const v = fallbackDb.vehicles.find(x => x.plate === trip.vehicle);
      if (v) {
        v.status = "idle"; // available
        if (data.actualDistance) v.odometer += data.actualDistance;
      }
      const d = fallbackDb.drivers.find(x => x.name === trip.driver);
      if (d) {
        d.status = "available";
        d.trips += 1;
      }

      // Record Fuel Log automatically if fuel was consumed
      if (data.fuelConsumed) {
        const fuelId = generateId("F");
        const fuelCost = data.fuelConsumed * 1.6; // average cost factor
        fallbackDb.fuelLogs.unshift({
          id: fuelId,
          vehicle: trip.vehicle,
          driver: trip.driver,
          date: new Date().toISOString().substring(0, 10),
          liters: data.fuelConsumed,
          cost: fuelCost,
          odometer: v ? v.odometer : 100000,
          station: "Auto Shell",
        });

        // Add expense
        fallbackDb.expenses.unshift({
          id: generateId("E"),
          date: new Date().toISOString().substring(0, 10),
          category: "Fuel",
          vehicle: trip.vehicle,
          description: `Auto-logged fuel from trip ${trip.id}`,
          amount: fuelCost,
          status: "approved"
        });
      }
    } else if (data.status === "cancelled") {
      const v = fallbackDb.vehicles.find(x => x.plate === trip.vehicle);
      if (v) v.status = "idle";
      const d = fallbackDb.drivers.find(x => x.name === trip.driver);
      if (d) d.status = "available";
    }
    return trip;
  }

  // Database Flow
  if (data.status === "in-progress") {
    await query("UPDATE vehicles SET status = 'active' WHERE plate = $1", [trip.vehicle]);
    await query("UPDATE drivers SET status = 'on-trip' WHERE name = $1", [trip.driver]);
  } else if (data.status === "completed") {
    const distanceVal = data.actualDistance || trip.distance;
    await query("UPDATE vehicles SET status = 'idle', odometer = odometer + $1 WHERE plate = $2", [distanceVal, trip.vehicle]);
    await query("UPDATE drivers SET status = 'available', trips = trips + 1 WHERE name = $1", [trip.driver]);

    if (data.fuelConsumed) {
      const fuelId = generateId("F");
      const fuelCost = data.fuelConsumed * 1.6;
      const today = new Date().toISOString().substring(0, 10);
      const vRows = await query("SELECT odometer FROM vehicles WHERE plate = $1", [trip.vehicle]);
      const odo = vRows[0] ? parseInt(vRows[0].odometer) : 100000;

      await query(
        "INSERT INTO fuel_logs (id, vehicle, driver, date, liters, cost, odometer, station) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [fuelId, trip.vehicle, trip.driver, today, data.fuelConsumed, fuelCost, odo, "Auto Shell"]
      );

      await query(
        "INSERT INTO expenses (id, date, category, vehicle, description, amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [generateId("E"), today, "Fuel", trip.vehicle, `Auto-logged fuel from trip ${trip.id}`, fuelCost, "approved"]
      );
    }
  } else if (data.status === "cancelled") {
    await query("UPDATE vehicles SET status = 'idle' WHERE plate = $1", [trip.vehicle]);
    await query("UPDATE drivers SET status = 'available' WHERE name = $1", [trip.driver]);
  }

  await query("UPDATE trips SET status = $1 WHERE id = $2", [data.status, data.tripId]);
  return { ...trip, status: data.status };
});

const createMaintenanceFn = createServerFn("POST", async (data: Omit<Maintenance, "id">) => {
  const id = generateId("M");

  if (isUsingFallback()) {
    fallbackDb.maintenance.unshift({ id, ...data });
    // Switch vehicle status to "maintenance" (In Shop)
    const v = fallbackDb.vehicles.find(x => x.plate === data.vehicle);
    if (v) v.status = "maintenance";
    return { id, ...data };
  }

  await query("UPDATE vehicles SET status = 'maintenance' WHERE plate = $1", [data.vehicle]);
  await query(
    "INSERT INTO maintenance (id, vehicle, type, due_date, cost, status, workshop) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [id, data.vehicle, data.type, data.dueDate, data.cost, data.status, data.workshop]
  );

  // Auto record maintenance expense
  await query(
    "INSERT INTO expenses (id, date, category, vehicle, description, amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [generateId("E"), data.dueDate, "Maintenance", data.vehicle, `Maintenance: ${data.type}`, data.cost, "approved"]
  );

  return { id, ...data };
});

const completeMaintenanceFn = createServerFn("POST", async (data: { id: string }) => {
  let record: any = null;
  if (isUsingFallback()) {
    record = fallbackDb.maintenance.find(m => m.id === data.id);
    if (record) {
      record.status = "completed";
      const v = fallbackDb.vehicles.find(x => x.plate === record.vehicle);
      if (v && v.status !== "retired") v.status = "idle";
    }
    return record;
  }

  const rows = await query("SELECT * FROM maintenance WHERE id = $1", [data.id]);
  if (rows.length > 0) record = mapMaintenance(rows[0]);
  if (!record) throw new Error("Maintenance record not found");

  await query("UPDATE maintenance SET status = 'completed' WHERE id = $1", [data.id]);
  // Restore vehicle status to idle (available) unless it's retired
  await query("UPDATE vehicles SET status = 'idle' WHERE plate = $1 AND status != 'retired'", [record.vehicle]);
  return { ...record, status: "completed" };
});

const createFuelFn = createServerFn("POST", async (data: Omit<FuelLog, "id">) => {
  const id = generateId("F");
  if (isUsingFallback()) {
    fallbackDb.fuelLogs.unshift({ id, ...data });
    fallbackDb.expenses.unshift({
      id: generateId("E"),
      date: data.date,
      category: "Fuel",
      vehicle: data.vehicle,
      description: `Fuel refill - ${data.station}`,
      amount: data.cost,
      status: "approved"
    });
    return { id, ...data };
  }

  await query(
    "INSERT INTO fuel_logs (id, vehicle, driver, date, liters, cost, odometer, station) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [id, data.vehicle, data.driver, data.date, data.liters, data.cost, data.odometer, data.station]
  );

  await query(
    "INSERT INTO expenses (id, date, category, vehicle, description, amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [generateId("E"), data.date, "Fuel", data.vehicle, `Fuel refill - ${data.station}`, data.cost, "approved"]
  );

  return { id, ...data };
});

const createExpenseFn = createServerFn("POST", async (data: Omit<Expense, "id">) => {
  const id = generateId("E");
  if (isUsingFallback()) {
    fallbackDb.expenses.unshift({ id, ...data });
    return { id, ...data };
  }
  await query(
    "INSERT INTO expenses (id, date, category, vehicle, description, amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [id, data.date, data.category, data.vehicle || null, data.description, data.amount, data.status]
  );
  return { id, ...data };
});

// Auth Service
const loginFn = createServerFn("POST", async (credentials: { email: string; password?: string }) => {
  if (isUsingFallback()) {
    const user = fallbackDb.users.find(u => u.email === credentials.email);
    if (!user) throw new Error("Invalid credentials");
    return { name: user.name, role: user.role, email: user.email, token: "mock.token" };
  }

  const rows = await query("SELECT * FROM users WHERE email = $1", [credentials.email]);
  if (rows.length === 0) throw new Error("Invalid credentials");
  const user = rows[0];
  return { name: user.name, role: rowToRole(user.role), email: user.email, token: "mock.token" };
});

function rowToRole(r: string) {
  return r;
}

// ----------------------------------------------------
// EXPORT API INTERFACE
// ----------------------------------------------------

export const api = {
  vehicles: {
    list: () => getVehiclesList(),
    create: (data: Omit<Vehicle & { maxLoad: number; acquisitionCost: number }, "id">) => createVehicleFn(data),
  },
  drivers: {
    list: () => getDriversList(),
    create: (data: Omit<Driver & { licenseCategory: string; licenseExpiry: string }, "id">) => createDriverFn(data),
  },
  trips: {
    list: () => getTripsList(),
    create: (data: { origin: string; destination: string; vehiclePlate: string; driverName: string; distance: number; cargoWeight: number }) => createTripFn(data),
    updateStatus: (data: { tripId: string; status: "in-progress" | "completed" | "cancelled"; actualDistance?: number; fuelConsumed?: number }) => updateTripStatusFn(data),
  },
  maintenance: {
    list: () => getMaintenanceList(),
    create: (data: Omit<Maintenance, "id">) => createMaintenanceFn(data),
    complete: (data: { id: string }) => completeMaintenanceFn(data),
  },
  fuel: {
    list: () => getFuelList(),
    create: (data: Omit<FuelLog, "id">) => createFuelFn(data),
  },
  expenses: {
    list: () => getExpensesList(),
    create: (data: Omit<Expense, "id">) => createExpenseFn(data),
  },
  analytics: {
    monthly: async () => {
      // Mock metrics matching the layout structure
      return monthlyFleetMetrics;
    },
    breakdown: async () => {
      // Calculate real cost breakdown from db if possible, otherwise use static breakdown
      return expenseBreakdown;
    },
  },
};

export const authService = {
  async login(email: string, _password?: string) {
    const res = await loginFn({ email });
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(res));
    }
    return res;
  },
  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    return true;
  },
  getCurrentUser() {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    }
    return null;
  }
};
