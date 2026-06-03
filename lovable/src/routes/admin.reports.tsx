import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Topbar, StatCard } from "@/components/dashboard/Shared";
import { getAdminReport, type AdminReport } from "@/lib/api";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

const emptyReport: AdminReport = {
  users: 0,
  revenueIdr: 0,
  invitations: 0,
  rsvp: 0,
  events: 0,
  templates: 0,
  chart: [],
  tiers: [],
};

function ReportsPage() {
  const [report, setReport] = useState<AdminReport>(emptyReport);
  const [message, setMessage] = useState("Memuat analytics...");

  useEffect(() => {
    getAdminReport()
      .then((data) => {
        setReport(data);
        setMessage("Insight performa platform dari database");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Gagal memuat analytics"));
  }, []);

  const max = Math.max(...report.chart.map((item) => item.value), 1);
  const totalTiers = useMemo(() => Math.max(report.tiers.reduce((sum, item) => sum + item.value, 0), 1), [report.tiers]);
  const arpu = report.users ? Math.round(report.revenueIdr / report.users) : 0;
  const conversion = report.users ? Math.round((report.invitations / report.users) * 1000) / 10 : 0;

  return (
    <>
      <Topbar title="Reports & Analytics" subtitle={message} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Revenue" value={rupiah(report.revenueIdr)} hint={`${report.events} event tracked`} accent="success" />
          <StatCard label="ARPU" value={rupiah(arpu)} hint={`${report.users} user`} accent="info" />
          <StatCard label="RSVP" value={String(report.rsvp)} hint={`${report.invitations} undangan`} accent="warning" />
          <StatCard label="Template" value={String(report.templates)} hint={`${conversion}% invite/user`} accent="gold" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card hairline p-6">
            <h3 className="font-serif text-lg mb-4">Revenue Bulanan</h3>
            <div className="flex items-end gap-2 h-48">
              {(report.chart.length ? report.chart : [{ label: "-", value: 0 }]).map((item) => (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-emerald-400/70" style={{ height: `${Math.max((item.value / max) * 100, 4)}%` }} />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card hairline p-6">
            <h3 className="font-serif text-lg mb-4">Distribusi Paket</h3>
            <div className="space-y-3">
              {(report.tiers.length ? report.tiers : [{ label: "free", value: 0 }]).map((tier) => {
                const pct = Math.round((tier.value / totalTiers) * 100);
                return (
                  <div key={tier.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="capitalize">{tier.label}</span><span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className={barColor(tier.label)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-lg mb-4">Ringkasan Operasional</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              { n: "User", v: report.users.toLocaleString("id-ID") },
              { n: "Undangan", v: report.invitations.toLocaleString("id-ID") },
              { n: "RSVP", v: report.rsvp.toLocaleString("id-ID") },
              { n: "Event Tracking", v: report.events.toLocaleString("id-ID") },
            ].map((card) => (
              <div key={card.n} className="rounded-lg bg-secondary/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">{card.n}</p>
                <p className="font-serif text-2xl mt-1">{card.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function barColor(label: string) {
  if (label === "business") return "h-full bg-emerald-400/70";
  if (label === "pro") return "h-full bg-gold";
  if (label === "creator") return "h-full bg-sky-400/70";
  return "h-full bg-muted";
}
