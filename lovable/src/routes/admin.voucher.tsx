import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { adminVouchers } from "@/lib/mock";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/voucher")({
  component: VoucherPage,
});

function VoucherPage() {
  return (
    <>
      <Topbar title="Voucher & Promo">
        <button className="inline-flex items-center gap-2 rounded-md bg-gold-gradient text-primary-foreground px-3 py-2 text-sm shadow-gold"><Plus className="size-4" />Buat Voucher</button>
      </Topbar>
      <div className="p-6">
        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">Kode</th><th className="text-left px-6 py-3">Diskon</th><th className="text-left px-6 py-3">Tipe</th><th className="text-left px-6 py-3">Terpakai</th><th className="text-left px-6 py-3">Kuota</th><th className="text-left px-6 py-3">Kadaluarsa</th><th className="text-left px-6 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {adminVouchers.map((v) => {
                const pct = (v.used / v.quota) * 100;
                return (
                  <tr key={v.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-3"><span className="font-mono text-gold">{v.code}</span></td>
                    <td className="px-6 py-3 font-medium">{v.discount}</td>
                    <td className="px-6 py-3 text-muted-foreground">{v.type}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 w-40">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gold-gradient" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{v.used}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{v.quota}</td>
                    <td className="px-6 py-3 text-muted-foreground">{v.expires}</td>
                    <td className="px-6 py-3"><StatusPill status={v.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
