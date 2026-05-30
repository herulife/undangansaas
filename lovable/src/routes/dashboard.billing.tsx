import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { Check } from "lucide-react";

const invoices = [
  { id: "INV-2026-001", item: "Upgrade Pro · Rara & Dimas", amount: "Rp199.000", date: "12 Mar 2026", status: "Paid" },
  { id: "INV-2026-002", item: "Upgrade Creator · Sari & Bagus", amount: "Rp99.000", date: "01 Apr 2026", status: "Paid" },
  { id: "INV-2026-003", item: "Top-up galeri 10 foto", amount: "Rp25.000", date: "10 May 2026", status: "Paid" },
];

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

function BillingPage() {
  return (
    <>
      <Topbar title="Billing & Paket" subtitle="Kelola paket dan invoice" />
      <div className="p-6 space-y-6">
        <div className="rounded-2xl p-6 bg-card hairline relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ backgroundImage: "var(--gradient-hero)" }} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold">Paket Saat Ini</p>
              <h2 className="font-serif text-3xl mt-1">Pro</h2>
              <p className="text-sm text-muted-foreground mt-1">Berakhir 12 Juni 2027 · Auto-renew aktif</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full hairline px-4 py-2 text-sm hover:bg-secondary">Kelola Auto-renew</button>
              <button className="rounded-full bg-gold-gradient text-primary-foreground px-5 py-2 text-sm shadow-gold">Upgrade ke Business</button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Free", price: "Rp0", current: false },
            { name: "Creator", price: "Rp99k", current: false },
            { name: "Pro", price: "Rp199k", current: true },
          ].map((t) => (
            <div key={t.name} className={`rounded-2xl p-5 ${t.current ? "bg-card ring-1 ring-gold/40" : "bg-card hairline"}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl">{t.name}</h3>
                {t.current && <span className="text-xs text-gold inline-flex items-center gap-1"><Check className="size-3" />Aktif</span>}
              </div>
              <p className="font-serif text-2xl mt-2">{t.price}</p>
              <button disabled={t.current} className="mt-4 w-full rounded-md hairline px-3 py-2 text-sm disabled:opacity-50">{t.current ? "Paket Aktif" : "Pilih"}</button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60"><h3 className="font-serif text-lg">Riwayat Invoice</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">No.</th><th className="text-left px-6 py-3">Item</th><th className="text-left px-6 py-3">Tanggal</th><th className="text-left px-6 py-3">Total</th><th className="text-left px-6 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {invoices.map((i) => (
                <tr key={i.id} className="hover:bg-secondary/30">
                  <td className="px-6 py-3 font-mono text-xs">{i.id}</td>
                  <td className="px-6 py-3">{i.item}</td>
                  <td className="px-6 py-3 text-muted-foreground">{i.date}</td>
                  <td className="px-6 py-3 font-medium">{i.amount}</td>
                  <td className="px-6 py-3"><StatusPill status={i.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
