import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatCard } from "@/components/dashboard/Shared";
import { adminKpi } from "@/lib/mock";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

function ReportsPage() {
  const max = Math.max(...adminKpi.chart);
  return (
    <>
      <Topbar title="Reports & Analytics" subtitle="Insight performa platform" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="MRR" value={rupiah(48200000)} hint="+12.4% MoM" accent="success" />
          <StatCard label="ARPU" value={rupiah(14800)} accent="info" />
          <StatCard label="Churn Rate" value="2.4%" hint="-0.3% MoM" accent="warning" />
          <StatCard label="Conversion" value="4.8%" hint="visit → paid" accent="gold" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card hairline p-6">
            <h3 className="font-serif text-lg mb-4">Pertumbuhan User</h3>
            <div className="flex items-end gap-2 h-48">
              {adminKpi.chart.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-sky-400/70" style={{ height: `${(v / max) * 100}%` }} />
                  <span className="text-[10px] text-muted-foreground">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card hairline p-6">
            <h3 className="font-serif text-lg mb-4">Distribusi Paket</h3>
            <div className="space-y-3">
              {[
                { name: "Free", pct: 62, color: "bg-muted" },
                { name: "Creator", pct: 22, color: "bg-sky-400/70" },
                { name: "Pro", pct: 13, color: "bg-gold" },
                { name: "Business", pct: 3, color: "bg-emerald-400/70" },
              ].map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>{p.name}</span><span className="text-muted-foreground">{p.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-lg mb-4">Acara Terpopuler</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[{n:"Wedding",v:"68%"},{n:"Ulang Tahun",v:"14%"},{n:"Khitanan",v:"9%"},{n:"Aqiqah",v:"6%"}].map((c) => (
              <div key={c.n} className="rounded-lg bg-secondary/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">{c.n}</p>
                <p className="font-serif text-2xl mt-1">{c.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
