// Placeholder API layer. Swap `mockRequest` for `fetch(BASE_URL + path, ...)`
// once the Django REST + JWT backend is available. Components/hooks never
// import mock-data directly — they go through these services.

import {
  vehicles,
  drivers,
  trips,
  maintenance,
  fuelLogs,
  expenses,
  monthlyFleetMetrics,
  expenseBreakdown,
} from "@/lib/mock-data";

const LATENCY_MS = 250;

async function mockRequest<T>(data: T): Promise<T> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  return structuredClone(data);
}

export const api = {
  vehicles: {
    list: () => mockRequest(vehicles),
  },
  drivers: {
    list: () => mockRequest(drivers),
  },
  trips: {
    list: () => mockRequest(trips),
  },
  maintenance: {
    list: () => mockRequest(maintenance),
  },
  fuel: {
    list: () => mockRequest(fuelLogs),
  },
  expenses: {
    list: () => mockRequest(expenses),
  },
  analytics: {
    monthly: () => mockRequest(monthlyFleetMetrics),
    breakdown: () => mockRequest(expenseBreakdown),
  },
};

// Auth placeholder — wire to Django JWT endpoints (/api/token/, /api/token/refresh/).
export const authService = {
  async login(_email: string, _password: string) {
    await new Promise((r) => setTimeout(r, 400));
    return { access: "mock.jwt.token", refresh: "mock.refresh.token" };
  },
  async logout() {
    return true;
  },
};
