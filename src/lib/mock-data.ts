// Mock data used by all pages until Django REST endpoints are wired.
// Kept in one file so switching to real API calls only touches src/services/*.

export type VehicleStatus = "active" | "maintenance" | "idle" | "retired";
export type Vehicle = {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  type: "Truck" | "Van" | "Car" | "Bus";
  status: VehicleStatus;
  odometer: number;
  fuelType: "Diesel" | "Petrol" | "Electric" | "Hybrid";
  driver?: string;
};

export const vehicles: Vehicle[] = [
  { id: "V-001", plate: "TX-4821", make: "Volvo", model: "FH16", year: 2022, type: "Truck", status: "active", odometer: 128430, fuelType: "Diesel", driver: "James Carter" },
  { id: "V-002", plate: "TX-9012", make: "Mercedes", model: "Actros", year: 2021, type: "Truck", status: "maintenance", odometer: 214800, fuelType: "Diesel", driver: "Priya Shah" },
  { id: "V-003", plate: "TX-1145", make: "Ford", model: "Transit", year: 2023, type: "Van", status: "active", odometer: 45200, fuelType: "Diesel", driver: "Mia Nguyen" },
  { id: "V-004", plate: "TX-7788", make: "Tesla", model: "Semi", year: 2024, type: "Truck", status: "idle", odometer: 12030, fuelType: "Electric" },
  { id: "V-005", plate: "TX-3391", make: "Scania", model: "R500", year: 2020, type: "Truck", status: "active", odometer: 302180, fuelType: "Diesel", driver: "Daniel Ochieng" },
  { id: "V-006", plate: "TX-6620", make: "Renault", model: "Master", year: 2022, type: "Van", status: "active", odometer: 76540, fuelType: "Diesel", driver: "Sofia Rossi" },
  { id: "V-007", plate: "TX-8834", make: "Iveco", model: "Daily", year: 2019, type: "Van", status: "retired", odometer: 410500, fuelType: "Diesel" },
  { id: "V-008", plate: "TX-2251", make: "MAN", model: "TGX", year: 2023, type: "Truck", status: "active", odometer: 61220, fuelType: "Diesel", driver: "Ahmed Al-Farsi" },
];

export type DriverStatus = "on-trip" | "available" | "off-duty" | "suspended";
export type Driver = {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  status: DriverStatus;
  rating: number;
  trips: number;
  vehicle?: string;
};

export const drivers: Driver[] = [
  { id: "D-101", name: "James Carter", email: "james@transitops.com", phone: "+1 415 555 0142", license: "CDL-A", status: "on-trip", rating: 4.8, trips: 312, vehicle: "TX-4821" },
  { id: "D-102", name: "Priya Shah", email: "priya@transitops.com", phone: "+1 415 555 0178", license: "CDL-A", status: "off-duty", rating: 4.9, trips: 428 },
  { id: "D-103", name: "Mia Nguyen", email: "mia@transitops.com", phone: "+1 415 555 0154", license: "CDL-B", status: "on-trip", rating: 4.7, trips: 201, vehicle: "TX-1145" },
  { id: "D-104", name: "Daniel Ochieng", email: "daniel@transitops.com", phone: "+254 700 123456", license: "CDL-A", status: "available", rating: 4.6, trips: 178, vehicle: "TX-3391" },
  { id: "D-105", name: "Sofia Rossi", email: "sofia@transitops.com", phone: "+39 331 555 8821", license: "CDL-B", status: "on-trip", rating: 4.9, trips: 355, vehicle: "TX-6620" },
  { id: "D-106", name: "Ahmed Al-Farsi", email: "ahmed@transitops.com", phone: "+971 50 555 3311", license: "CDL-A", status: "available", rating: 4.5, trips: 142, vehicle: "TX-2251" },
  { id: "D-107", name: "Lena Müller", email: "lena@transitops.com", phone: "+49 151 555 7788", license: "CDL-A", status: "suspended", rating: 3.9, trips: 88 },
];

export type TripStatus = "in-progress" | "scheduled" | "completed" | "cancelled";
export type Trip = {
  id: string;
  vehicle: string;
  driver: string;
  origin: string;
  destination: string;
  distance: number;
  startedAt: string;
  status: TripStatus;
};

export const trips: Trip[] = [
  { id: "T-9001", vehicle: "TX-4821", driver: "James Carter", origin: "San Francisco, CA", destination: "Los Angeles, CA", distance: 615, startedAt: "2026-07-11 06:20", status: "in-progress" },
  { id: "T-9002", vehicle: "TX-1145", driver: "Mia Nguyen", origin: "Oakland, CA", destination: "Sacramento, CA", distance: 138, startedAt: "2026-07-11 08:00", status: "in-progress" },
  { id: "T-9003", vehicle: "TX-3391", driver: "Daniel Ochieng", origin: "Portland, OR", destination: "Seattle, WA", distance: 280, startedAt: "2026-07-11 05:15", status: "completed" },
  { id: "T-9004", vehicle: "TX-6620", driver: "Sofia Rossi", origin: "Milan, IT", destination: "Rome, IT", distance: 580, startedAt: "2026-07-12 07:00", status: "scheduled" },
  { id: "T-9005", vehicle: "TX-2251", driver: "Ahmed Al-Farsi", origin: "Dubai, AE", destination: "Abu Dhabi, AE", distance: 150, startedAt: "2026-07-10 14:30", status: "completed" },
  { id: "T-9006", vehicle: "TX-4821", driver: "James Carter", origin: "Fresno, CA", destination: "San Diego, CA", distance: 520, startedAt: "2026-07-09 09:00", status: "cancelled" },
];

export type MaintenanceStatus = "scheduled" | "in-progress" | "overdue" | "completed";
export type Maintenance = {
  id: string;
  vehicle: string;
  type: string;
  dueDate: string;
  cost: number;
  status: MaintenanceStatus;
  workshop: string;
};

export const maintenance: Maintenance[] = [
  { id: "M-501", vehicle: "TX-9012", type: "Engine overhaul", dueDate: "2026-07-15", cost: 4800, status: "in-progress", workshop: "MetroFleet Garage" },
  { id: "M-502", vehicle: "TX-4821", type: "Tire rotation", dueDate: "2026-07-20", cost: 220, status: "scheduled", workshop: "QuickTire Center" },
  { id: "M-503", vehicle: "TX-3391", type: "Brake service", dueDate: "2026-07-05", cost: 640, status: "overdue", workshop: "MetroFleet Garage" },
  { id: "M-504", vehicle: "TX-1145", type: "Oil change", dueDate: "2026-06-28", cost: 145, status: "completed", workshop: "Rapid Lube" },
  { id: "M-505", vehicle: "TX-2251", type: "Annual inspection", dueDate: "2026-08-01", cost: 380, status: "scheduled", workshop: "MetroFleet Garage" },
  { id: "M-506", vehicle: "TX-7788", type: "Battery diagnostics", dueDate: "2026-07-13", cost: 210, status: "scheduled", workshop: "EV Service Hub" },
];

export type FuelLog = {
  id: string;
  vehicle: string;
  driver: string;
  date: string;
  liters: number;
  cost: number;
  odometer: number;
  station: string;
};

export const fuelLogs: FuelLog[] = [
  { id: "F-2001", vehicle: "TX-4821", driver: "James Carter", date: "2026-07-10", liters: 320, cost: 512.8, odometer: 128200, station: "Shell #221" },
  { id: "F-2002", vehicle: "TX-3391", driver: "Daniel Ochieng", date: "2026-07-10", liters: 280, cost: 448.0, odometer: 301950, station: "BP Truckstop 14" },
  { id: "F-2003", vehicle: "TX-1145", driver: "Mia Nguyen", date: "2026-07-09", liters: 95, cost: 152.3, odometer: 45080, station: "Chevron #98" },
  { id: "F-2004", vehicle: "TX-6620", driver: "Sofia Rossi", date: "2026-07-09", liters: 110, cost: 189.2, odometer: 76400, station: "Eni Autostrada" },
  { id: "F-2005", vehicle: "TX-2251", driver: "Ahmed Al-Farsi", date: "2026-07-08", liters: 210, cost: 178.5, odometer: 61080, station: "ADNOC 03" },
];

export type ExpenseCategory = "Fuel" | "Maintenance" | "Insurance" | "Tolls" | "Salary" | "Other";
export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  vehicle?: string;
  description: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
};

export const expenses: Expense[] = [
  { id: "E-401", date: "2026-07-10", category: "Fuel", vehicle: "TX-4821", description: "Diesel refill — Shell #221", amount: 512.8, status: "approved" },
  { id: "E-402", date: "2026-07-09", category: "Tolls", vehicle: "TX-1145", description: "I-80 toll pass", amount: 42, status: "approved" },
  { id: "E-403", date: "2026-07-08", category: "Maintenance", vehicle: "TX-9012", description: "Engine overhaul deposit", amount: 2400, status: "pending" },
  { id: "E-404", date: "2026-07-07", category: "Insurance", description: "Fleet policy renewal", amount: 8600, status: "approved" },
  { id: "E-405", date: "2026-07-06", category: "Other", vehicle: "TX-3391", description: "Cabin cleaning", amount: 85, status: "rejected" },
  { id: "E-406", date: "2026-07-05", category: "Salary", description: "Driver overtime — June", amount: 3200, status: "approved" },
];

export const monthlyFleetMetrics = [
  { month: "Jan", trips: 210, distance: 42000, fuelCost: 18400 },
  { month: "Feb", trips: 232, distance: 46800, fuelCost: 19200 },
  { month: "Mar", trips: 268, distance: 51200, fuelCost: 21400 },
  { month: "Apr", trips: 254, distance: 49200, fuelCost: 20800 },
  { month: "May", trips: 289, distance: 55100, fuelCost: 22600 },
  { month: "Jun", trips: 305, distance: 58400, fuelCost: 23800 },
  { month: "Jul", trips: 322, distance: 61200, fuelCost: 24950 },
];

export const expenseBreakdown = [
  { name: "Fuel", value: 24950 },
  { name: "Maintenance", value: 12480 },
  { name: "Insurance", value: 8600 },
  { name: "Tolls", value: 3120 },
  { name: "Salary", value: 18400 },
  { name: "Other", value: 2100 },
];
