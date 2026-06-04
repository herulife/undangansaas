import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CreditCard,
  FileHeart,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquareHeart,
  Plus,
  Settings,
  ShoppingBag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { clearAuthSession, getStoredUser } from "@/lib/api";

type MobileItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  primary?: boolean;
};

const userItems: MobileItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, primary: true },
  { to: "/dashboard/undangan", label: "Undangan", icon: FileHeart, primary: true },
  { to: "/dashboard/buat", label: "Buat", icon: Plus, primary: true },
  { to: "/dashboard/template", label: "Template", icon: LayoutTemplate, primary: true },
  { to: "/dashboard/rsvp", label: "RSVP", icon: MessageSquareHeart },
  { to: "/dashboard/tamu", label: "Tamu", icon: Users },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
];

const adminItems: MobileItem[] = [
  { to: "/admin", label: "Home", icon: LayoutDashboard, primary: true },
  { to: "/admin/users", label: "Users", icon: Users, primary: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, primary: true },
  { to: "/admin/reports", label: "Reports", icon: BarChart3, primary: true },
  { to: "/admin/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/admin/payment-gateway", label: "Payment", icon: CreditCard },
  { to: "/admin/voucher", label: "Voucher", icon: Ticket },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function MobileDashboardNav({ mode }: { mode: "user" | "admin" }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const user = getStoredUser();
  const items = mode === "admin" ? adminItems : userItems;
  const primaryItems = items.filter((item) => item.primary);
  const secondaryItems = items.filter((item) => !item.primary);
  const title = mode === "admin" ? "Admin Panel" : "Undanganku";

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/login";
  };

  return (
    <>
      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-border/60 bg-card/95 p-2 shadow-elegant backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {primaryItems.map((item) => (
            <MobileNavLink key={item.to} item={item} active={isActive(pathname, item.to)} onClick={() => setOpen(false)} />
          ))}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground"
            aria-label="Buka menu lainnya"
          >
            <Menu className="size-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)}>
          <aside
            className="absolute inset-x-3 bottom-3 rounded-3xl border border-border/60 bg-card p-4 shadow-elegant"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-serif text-xl text-gold-gradient">{title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {mode === "admin" ? "Kelola platform" : user?.displayName || user?.email || "Menu cepat"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full hairline text-muted-foreground"
                aria-label="Tutup menu"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to as never}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      active ? "bg-gold/15 text-gold" : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            >
              <LogOut className="size-4" />
              Keluar
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

function MobileNavLink({ item, active, onClick }: { item: MobileItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to as never}
      onClick={onClick}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] transition ${
        active ? "bg-gold/15 text-gold" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
      }`}
    >
      <Icon className="size-5" />
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}

function isActive(pathname: string, to: string) {
  if (to === "/dashboard" || to === "/admin") return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}
