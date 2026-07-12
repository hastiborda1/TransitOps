import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { authService } from "@/services/api";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

