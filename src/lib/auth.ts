export type UserRole = "fleet-manager" | "safety-officer" | "financial-analyst" | "driver" | "admin" | null;

export const AUTH_KEY = "transitops_auth_role";

export const useAuth = () => {
  const login = (role: UserRole, identifier: string) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ role, identifier }));
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
  };

  const getUserRole = (): UserRole => {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.role as UserRole;
      }
    } catch (e) {
      // Ignored
    }
    return null;
  };

  return { login, logout, getUserRole };
};
