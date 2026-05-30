import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatCard, StatusPill } from "@/components/dashboard/Shared";
import { adminKpi, adminOrders, adminTemplates } from "@/lib/mock";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

function AdminDashboard() {
  const max = Math.max(...adminKpi.chart);
  return (
    <>
      <Topbar title="Admin Dashboard" subtitle="Ringkasan operasional 12 bulan terakhir" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Users Aktif" value={adminKpi.users.toLocaleString()} hint="+8.2% MoM" accent="info" />
          <StatCard label="Revenue" value={rupiah(adminKpi.revenue)} hint="bulan ini" accent="success" />
          <StatCard label="Undangan" value={adminKpi.invitations.toLocaleString()} hint="total dibuat" accent="gold" />
          <StatCard label="RSVP" value={adminKpi.rsvp.toLocaleString()} hint="aktivitas tamu" accent="warning" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-card hairline p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-lg">Revenue Trend</h3>
                <p className="text-xs text-muted-foreground">12 bulan terakhir</p>
              </div>
              <span className="text-xs text-emerald-300">▲ 24.6%</span>
            </div>
            <div className="flex items-end gap-2 h-44">
              {adminKpi.chart.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-gold-gradient opacity-90" style={{ height: `${(v / max) * 100}%` }} />
                  <span className="text-[10px] text-muted-foreground">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card hairline p-6">
            <h3 className="font-serif text-lg mb-4">Template Populer</h3>
            <ul className="space-y-3">
              {adminTemplates.slice(0, 5).sort((a, b) => b.uses - a.uses).map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="size-10 rounded-md object-cover hairline" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.uses.toLocaleString()} pemakaian</p>
                  </div>
                  <span className="text-xs text-gold">{t.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60"><h3 className="font-serif text-lg">Transaksi Terbaru</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">No.</th><th className="text-left px-6 py-3">User</th><th className="text-left px-6 py-3">Plan</th><th className="text-left px-6 py-3">Metode</th><th className="text-left px-6 py-3">Jumlah</th><th className="text-left px-6 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {adminOrders.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-secondary/30">
                  <td className="px-6 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-6 py-3">{o.user}</td>
                  <td className="px-6 py-3 text-muted-foreground">{o.plan}</td>
                  <td className="px-6 py-3 text-muted-foreground">{o.method}</td>
                  <td className="px-6 py-3 font-medium">{rupiah(o.amount)}</td>
                  <td className="px-6 py-3"><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
