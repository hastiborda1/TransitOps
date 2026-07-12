import type {
  Vehicle,
  Driver,
  Trip,
  Maintenance,
  FuelLog,
  Expense,
} from "@/lib/mock-data";

const BASE_URL = "http://localhost:8000/api";

// Helper to get auth header
function getAuthHeaders(): HeadersInit {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.token) {
          return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${parsed.token}`,
          };
        }
      } catch (e) {
        console.error("Failed to parse user token", e);
      }
    }
  }
  return {
    "Content-Type": "application/json",
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const mergedHeaders = {
    ...getAuthHeaders(),
    ...(options?.headers ?? {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    let errMsg = "Request failed";
    try {
      const errData = await response.json();
      errMsg = errData.detail || errData.message || JSON.stringify(errData) || errMsg;
    } catch {
      errMsg = response.statusText || errMsg;
    }
    throw new Error(errMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  vehicles: {
    list: () => request<Vehicle[]>("/vehicles/"),
    create: (data: Omit<Vehicle & { maxLoad: number; acquisitionCost: number }, "id">) =>
      request<Vehicle>("/vehicles/", {
        method: "POST",
        body: JSON.stringify({
          plate: data.plate,
          make: data.make,
          model: data.model,
          year: data.year,
          type: data.type,
          status: data.status,
          odometer: data.odometer,
          fuelType: data.fuelType,
          driver: data.driver || null,
          maxLoad: data.maxLoad,
          acquisitionCost: data.acquisitionCost,
        }),
      }),
  },
  drivers: {
    list: () => request<Driver[]>("/drivers/"),
    create: (data: Omit<Driver & { licenseCategory: string; licenseExpiry: string }, "id">) =>
      request<Driver>("/drivers/", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          license: data.license,
          status: data.status,
          rating: data.rating,
          trips: data.trips,
          vehicle: data.vehicle || null,
          licenseCategory: data.licenseCategory,
          licenseExpiry: data.licenseExpiry,
        }),
      }),
  },
  trips: {
    list: () => request<Trip[]>("/trips/"),
    create: (data: { origin: string; destination: string; vehiclePlate: string; driverName: string; distance: number; cargoWeight: number }) =>
      request<Trip>("/trips/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateStatus: (data: { tripId: string; status: "in-progress" | "completed" | "cancelled"; actualDistance?: number; fuelConsumed?: number }) =>
      request<Trip>(`/trips/${data.tripId}/update-status/`, {
        method: "POST",
        body: JSON.stringify({
          status: data.status,
          actualDistance: data.actualDistance,
          fuelConsumed: data.fuelConsumed,
        }),
      }),
  },
  maintenance: {
    list: () => request<Maintenance[]>("/maintenance/"),
    create: (data: Omit<Maintenance, "id">) =>
      request<Maintenance>("/maintenance/", {
        method: "POST",
        body: JSON.stringify({
          vehicle: data.vehicle,
          type: data.type,
          workshop: data.workshop,
          dueDate: data.dueDate,
          cost: data.cost,
          status: data.status,
        }),
      }),
    complete: (data: { id: string }) =>
      request<Maintenance>(`/maintenance/${data.id}/complete/`, {
        method: "POST",
      }),
  },
  fuel: {
    list: () => request<FuelLog[]>("/fuel/"),
    create: (data: Omit<FuelLog, "id">) =>
      request<FuelLog>("/fuel/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  expenses: {
    list: () => request<Expense[]>("/expenses/"),
    create: (data: Omit<Expense, "id">) =>
      request<Expense>("/expenses/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  analytics: {
    monthly: () => request<any[]>("/analytics/monthly/"),
    breakdown: () => request<any[]>("/analytics/breakdown/"),
  },
};

export const authService = {
  async login(email: string, password?: string) {
    // Map email input to username for fallback support
    let username = email;
    if (email.includes("@")) {
      const prefix = email.split("@")[0];
      if (["manager", "driver", "safety", "finance"].includes(prefix)) {
        username = prefix;
      }
    }

    const res = await request<any>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        username,
        password: password || "demo1234",
      }),
    });

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
  },
};
