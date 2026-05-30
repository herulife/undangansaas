import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserSidebar } from "@/components/dashboard/UserSidebar";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="min-h-screen flex">
      <UserSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
