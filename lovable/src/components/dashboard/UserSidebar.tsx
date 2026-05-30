import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileHeart, Plus, LayoutTemplate, MessageSquareHeart,
  Users, CreditCard, Settings, LogOut,
} from "lucide-react";

type Item = { to: string; label: string; icon: typeof LayoutDashboard; highlight?: boolean };
const items: Item[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/undangan", label: "Undangan Saya", icon: FileHeart },
  { to: "/dashboard/buat", label: "Buat Undangan", icon: Plus, highlight: true },
  { to: "/dashboard/template", label: "Template", icon: LayoutTemplate },
  { to: "/dashboard/rsvp", label: "RSVP & Ucapan", icon: MessageSquareHeart },
  { to: "/dashboard/tamu", label: "Tamu Undangan", icon: Users },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
];

export function UserSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="w-64 shrink-0 border-r border-border/60 bg-surface/40 min-h-screen sticky top-0 flex flex-col">
      <div className="px-6 h-16 flex items-center border-b border-border/60">
        <Link to="/" className="font-serif text-xl text-gold-gradient">Undanganku</Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          const base = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition";
          if (it.highlight) {
            return (
              <Link key={it.to} to={it.to as never} className="flex items-center gap-3 rounded-lg bg-gold-gradient text-primary-foreground px-3 py-2.5 text-sm font-medium shadow-gold my-2">
                <Icon className="size-4" /> {it.label}
              </Link>
            );
          }
          return (
            <Link
              key={it.to}
              to={it.to as never}
              className={`${base} ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}
            >
              <Icon className="size-4" /> {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border/60">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/40">
          <div className="size-9 rounded-full bg-gold-gradient flex items-center justify-center text-primary-foreground font-medium">R</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Rara W.</div>
            <div className="text-xs text-muted-foreground truncate">Plan Pro</div>
          </div>
          <Link to="/" aria-label="Keluar" className="text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
