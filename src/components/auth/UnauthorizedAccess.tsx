import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { authService } from "@/services/api";
import { useAuth } from "@/lib/auth";

export function UnauthorizedAccess() {
  const { logout } = useAuth();

  const handleLogout = () => {
    authService.logout();
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Unauthorized Access</h1>
        <p className="text-muted-foreground">
          Your current role does not have permission to view this page. If you believe this is a mistake, please contact your system administrator.
        </p>
        <div className="pt-6">
          <Link
            to="/login"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
