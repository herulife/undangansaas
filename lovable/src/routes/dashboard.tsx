import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserSidebar } from "@/components/dashboard/UserSidebar";
import { MobileDashboardNav } from "@/components/dashboard/MobileDashboardNav";
import { getAuthToken } from "@/lib/api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard User - Undanganku" },
      { name: "description", content: "Kelola undangan digital, tamu, RSVP, template, billing, dan pengaturan akun." },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      window.location.href = "/login";
      return;
    }
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memeriksa sesi...</div>;
  }

  return (
    <div className="min-h-screen flex">
      <UserSidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-0">
        <Outlet />
      </div>
      <MobileDashboardNav mode="user" />
    </div>
  );
}
