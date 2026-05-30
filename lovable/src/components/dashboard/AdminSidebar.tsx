import { Link, useRouterState } from "@tanstack/react-router";
import { clearAuthSession } from "@/lib/api";
import {
  LayoutDashboard, Users, LayoutTemplate, ShoppingBag, Ticket,
  BarChart3, Image, Settings, LogOut, Shield,
} from "lucide-react";

type Item = { to: string; label: string; icon: typeof LayoutDashboard };
const items: Item[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/voucher", label: "Voucher", icon: Ticket },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/login";
  };

  return (
    <aside className="w-60 shrink-0 bg-[oklch(0.09_0.005_60)] text-foreground border-r border-border/60 min-h-screen sticky top-0 flex flex-col">
      <div className="px-5 h-16 flex items-center gap-2 border-b border-border/60">
        <Shield className="size-5 text-gold" />
        <span className="font-serif text-lg">Admin Panel</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to} to={it.to as never}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-gold/15 text-gold border-l-2 border-gold pl-[10px]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" /> {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between">
        <span>v1.0.0 - ops</span>
        <button type="button" onClick={handleLogout} aria-label="Keluar" className="hover:text-foreground"><LogOut className="size-4" /></button>
      </div>
    </aside>
  );
}

