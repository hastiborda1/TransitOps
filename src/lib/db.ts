import {
  vehicles as mockVehicles,
  drivers as mockDrivers,
  trips as mockTrips,
  maintenance as mockMaintenance,
  fuelLogs as mockFuelLogs,
  expenses as mockExpenses,
  type Vehicle,
  type Driver,
  type Trip,
  type Maintenance,
  type FuelLog,
  type Expense,
} from "./mock-data";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/Transit";

let pool: any = null;
let useFallbackDb = true;

// Fallback in-memory database extending the mock data with business rules requirements
export const fallbackDb = {
  users: [
    { id: "U-001", email: "manager@transitops.com", password: "demo1234", name: "Manager User", role: "manager" },
    { id: "U-002", email: "driver@transitops.com", password: "demo1234", name: "Driver User", role: "driver" },
    { id: "U-003", email: "safety@transitops.com", password: "demo1234", name: "Safety Officer", role: "safety" },
    { id: "U-004", email: "finance@transitops.com", password: "demo1234", name: "Financial Analyst", role: "finance" },
  ],
  vehicles: mockVehicles.map(v => ({
    ...v,
    maxLoad: v.type === "Truck" ? 15000 : v.type === "Van" ? 2500 : 800, // kg
    acquisitionCost: v.type === "Truck" ? 85000 : v.type === "Van" ? 35000 : 15000,
  })),
  drivers: mockDrivers.map(d => ({
    ...d,
    licenseCategory: d.license === "CDL-A" ? "Heavy Truck" : "Light Truck",
    licenseExpiry: "2027-12-31", // Valid expiry
  })),
  trips: mockTrips.map(t => ({
    ...t,
    cargoWeight: 500, // Default kg
    plannedDistance: t.distance,
  })),
  maintenance: [...mockMaintenance],
  fuelLogs: [...mockFuelLogs],
  expenses: [...mockExpenses],
};

async function getPool() {
  if (typeof window !== "undefined") {
    useFallbackDb = true;
    return null;
  }
  if (pool) return pool;
  try {
    const pg = await import("pg");
    pool = new pg.default.Pool({
      connectionString,
      connectionTimeoutMillis: 2000,
    });
    return pool;
  } catch (e) {
    console.warn("PostgreSQL connection failed to initialize, using in-memory store instead:", e);
    useFallbackDb = true;
    return null;
  }
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const activePool = await getPool();
  if (useFallbackDb || !activePool) {
    return mockQueryFallback(text, params);
  }
  try {
    const res = await activePool.query(text, params);
    return res.rows as T[];
  } catch (err) {
    console.error("Database query error, falling back to in-memory store:", err);
    useFallbackDb = true;
    return mockQueryFallback(text, params);
  }
}

// Simple fallback mock query runner for in-memory emulation
function mockQueryFallback(text: string, params?: any[]): any[] {
  const lower = text.toLowerCase();
  if (lower.includes("select") && lower.includes("vehicles")) {
    return fallbackDb.vehicles;
  }
  if (lower.includes("select") && lower.includes("drivers")) {
    return fallbackDb.drivers;
  }
  if (lower.includes("select") && lower.includes("trips")) {
    return fallbackDb.trips;
  }
  if (lower.includes("select") && lower.includes("maintenance")) {
    return fallbackDb.maintenance;
  }
  if (lower.includes("select") && lower.includes("fuel_logs")) {
    return fallbackDb.fuelLogs;
  }
  if (lower.includes("select") && lower.includes("expenses")) {
    return fallbackDb.expenses;
  }
  if (lower.includes("select") && lower.includes("users")) {
    if (params && params[0]) {
      const u = fallbackDb.users.find(x => x.email === params[0]);
      return u ? [u] : [];
    }
    return fallbackDb.users;
  }
  return [];
}

export async function initDb() {
  if (typeof window !== "undefined") return;
  
  // Only attempt PostgreSQL connection if a connection string is set
  if (!process.env.DATABASE_URL) {
    console.log("No DATABASE_URL configured. Using in-memory database store.");
    useFallbackDb = true;
    return;
  }

  const activePool = await getPool();
  if (!activePool) {
    console.log("Failed to initialize database pool. Using in-memory database store.");
    useFallbackDb = true;
    return;
  }

  try {
    const client = await activePool.connect();
    client.release();
    console.log("Connected to PostgreSQL database successfully.");
    useFallbackDb = false;

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL
      );
    `);

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(50) PRIMARY KEY,
        plate VARCHAR(50) UNIQUE NOT NULL,
        make VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        odometer INTEGER NOT NULL,
        fuel_type VARCHAR(20) NOT NULL,
        driver VARCHAR(100),
        max_load INTEGER NOT NULL DEFAULT 1000,
        acquisition_cost INTEGER NOT NULL DEFAULT 20000
      );
    `);

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        license VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        rating NUMERIC(3, 2) NOT NULL,
        trips INTEGER NOT NULL,
        vehicle VARCHAR(50),
        license_category VARCHAR(50) NOT NULL DEFAULT 'Light Truck',
        license_expiry VARCHAR(50) NOT NULL DEFAULT '2027-12-31'
      );
    `);

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id VARCHAR(50) PRIMARY KEY,
        vehicle VARCHAR(50) NOT NULL,
        driver VARCHAR(100) NOT NULL,
        origin VARCHAR(100) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        distance INTEGER NOT NULL,
        started_at VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        cargo_weight INTEGER NOT NULL DEFAULT 500,
        planned_distance INTEGER NOT NULL DEFAULT 100
      );
    `);

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS maintenance (
        id VARCHAR(50) PRIMARY KEY,
        vehicle VARCHAR(50) NOT NULL,
        type VARCHAR(100) NOT NULL,
        due_date VARCHAR(50) NOT NULL,
        cost INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL,
        workshop VARCHAR(100) NOT NULL
      );
    `);

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS fuel_logs (
        id VARCHAR(50) PRIMARY KEY,
        vehicle VARCHAR(50) NOT NULL,
        driver VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        liters NUMERIC(10, 2) NOT NULL,
        cost NUMERIC(10, 2) NOT NULL,
        odometer INTEGER NOT NULL,
        station VARCHAR(100) NOT NULL
      );
    `);

    await activePool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(50) PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        category VARCHAR(20) NOT NULL,
        vehicle VARCHAR(50),
        description VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL
      );
    `);

    const usersCount = await activePool.query("SELECT COUNT(*) FROM users");
    if (parseInt(usersCount.rows[0].count) === 0) {
      console.log("Seeding default DB tables...");

      for (const u of fallbackDb.users) {
        await activePool.query(
          "INSERT INTO users (id, email, password, name, role) VALUES ($1, $2, $3, $4, $5)",
          [u.id, u.email, u.password, u.name, u.role]
        );
      }

      for (const v of fallbackDb.vehicles) {
        await activePool.query(
          "INSERT INTO vehicles (id, plate, make, model, year, type, status, odometer, fuel_type, driver, max_load, acquisition_cost) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
          [v.id, v.plate, v.make, v.model, v.year, v.type, v.status, v.odometer, v.fuelType, v.driver || null, v.maxLoad, v.acquisitionCost]
        );
      }

      for (const d of fallbackDb.drivers) {
        await activePool.query(
          "INSERT INTO drivers (id, name, email, phone, license, status, rating, trips, vehicle, license_category, license_expiry) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
          [d.id, d.name, d.email, d.phone, d.license, d.status, d.rating, d.trips, d.vehicle || null, d.licenseCategory, d.licenseExpiry]
        );
      }

      for (const t of fallbackDb.trips) {
        await activePool.query(
          "INSERT INTO trips (id, vehicle, driver, origin, destination, distance, started_at, status, cargo_weight, planned_distance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [t.id, t.vehicle, t.driver, t.origin, t.destination, t.distance, t.startedAt, t.status, t.cargoWeight, t.plannedDistance]
        );
      }

      for (const m of fallbackDb.maintenance) {
        await activePool.query(
          "INSERT INTO maintenance (id, vehicle, type, due_date, cost, status, workshop) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [m.id, m.vehicle, m.type, m.dueDate, m.cost, m.status, m.workshop]
        );
      }

      for (const f of fallbackDb.fuelLogs) {
        await activePool.query(
          "INSERT INTO fuel_logs (id, vehicle, driver, date, liters, cost, odometer, station) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [f.id, f.vehicle, f.driver, f.date, f.liters, f.cost, f.odometer, f.station]
        );
      }

      for (const e of fallbackDb.expenses) {
        await activePool.query(
          "INSERT INTO expenses (id, date, category, vehicle, description, amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [e.id, e.date, e.category, e.vehicle || null, e.description, e.amount, e.status]
        );
      }
      console.log("Seeding completed successfully.");
    }
  } catch (error) {
    console.error("PostgreSQL connection / migration error. Switching to fallback in-memory DB.", error);
    useFallbackDb = true;
  }
}

initDb().catch((err) => {
  console.error("Database initialization failed:", err);
  useFallbackDb = true;
});

export function isUsingFallback() {
  return useFallbackDb;
}
