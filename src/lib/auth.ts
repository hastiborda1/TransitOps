export type UserRole = "fleet-manager" | "safety-officer" | "financial-analyst" | "driver" | "admin" | null;

export const AUTH_KEY = "transitops_auth_role";

export const DEMO_CREDENTIALS = {
  "admin": { email: "admin@transitops.com", password: "admin123", name: "Administrator" },
  "fleet-manager": { email: "fleet@transitops.com", password: "fleet123", name: "Fleet Manager" },
  "safety-officer": { email: "safety@transitops.com", password: "safety123", name: "Safety Officer" },
  "financial-analyst": { email: "finance@transitops.com", password: "finance123", name: "Financial Analyst" },
  "driver": { employeeId: "DRV001", password: "driver123", name: "Driver" },
};

export const useAuth = () => {
  const login = (role: UserRole, identifier: string, name: string) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ role, identifier, name }));
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
  };

  const getSession = () => {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(AUTH_KEY);
      if (data) {
        return JSON.parse(data) as { role: UserRole; identifier: string; name: string };
      }
    } catch (e) {
      // Ignored
    }
    return null;
  };

  const getUserRole = (): UserRole => {
    return getSession()?.role || null;
  };

  return { login, logout, getUserRole, getSession };
};
