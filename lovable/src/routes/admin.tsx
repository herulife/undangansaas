import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { clearAuthSession, getAuthToken, getMe } from "@/lib/api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    if (!getAuthToken()) {
      window.location.href = "/login";
      return;
    }
    getMe()
      .then((user) => {
        if (user.role === "admin") {
          setStatus("allowed");
          return;
        }
        setStatus("denied");
      })
      .catch(() => {
        clearAuthSession();
        window.location.href = "/login";
      });
  }, []);

  if (status === "checking") {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memeriksa akses admin...</div>;
  }

  if (status === "denied") {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div className="max-w-sm rounded-2xl bg-card p-7 hairline">
          <p className="text-xs uppercase tracking-widest text-gold">Admin only</p>
          <h1 className="mt-3 font-serif text-3xl">Akses ditolak</h1>
          <p className="mt-2 text-sm text-muted-foreground">Akun ini tidak punya role admin.</p>
          <a href="/dashboard" className="mt-5 inline-flex rounded-full bg-gold-gradient px-5 py-2 text-sm text-primary-foreground">Kembali ke dashboard</a>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
