import { Bell, Search } from "lucide-react";

export function Topbar({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="h-16 px-6 border-b border-border/60 flex items-center gap-4 sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
      <div className="flex-1 min-w-0">
        <h1 className="font-serif text-xl truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="hidden md:flex items-center gap-2 rounded-full hairline px-3 py-1.5 text-sm w-72">
        <Search className="size-4 text-muted-foreground" />
        <input placeholder="Cari..." className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground" />
      </div>
      <button className="size-9 rounded-full hairline flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Notifikasi">
        <Bell className="size-4" />
      </button>
      {children}
    </header>
  );
}

export function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: "gold" | "info" | "success" | "warning" | "danger" }) {
  const accentMap: Record<string, string> = {
    gold: "from-gold/20 to-transparent text-gold",
    info: "from-sky-500/20 to-transparent text-sky-300",
    success: "from-emerald-500/20 to-transparent text-emerald-300",
    warning: "from-amber-500/20 to-transparent text-amber-300",
    danger: "from-rose-500/20 to-transparent text-rose-300",
  };
  const grad = accentMap[accent ?? "gold"];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card hairline p-5">
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${grad} opacity-60`} />
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-serif text-3xl mt-2">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Published: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Draft: "bg-muted text-muted-foreground border-border",
    Active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Failed: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    Suspended: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    Expired: "bg-muted text-muted-foreground border-border",
    Sent: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    Hadir: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    "Tidak Hadir": "bg-rose-500/15 text-rose-300 border-rose-500/30",
    "Ragu-ragu": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>{status}</span>;
}
