import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatCard, StatusPill } from "@/components/dashboard/Shared";
import { adminOrders } from "@/lib/mock";
import { Download } from "lucide-react";

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const total = adminOrders.filter((o) => o.status === "Paid").reduce((s, o) => s + o.amount, 0);
  const pending = adminOrders.filter((o) => o.status === "Pending").length;
  const failed = adminOrders.filter((o) => o.status === "Failed").length;
  return (
    <>
      <Topbar title="Orders & Payments">
        <button className="inline-flex items-center gap-2 rounded-md hairline px-3 py-2 text-sm hover:bg-secondary"><Download className="size-4" />Export</button>
      </Topbar>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Paid" value={rupiah(total)} accent="success" />
          <StatCard label="Pending" value={String(pending)} accent="warning" />
          <StatCard label="Failed" value={String(failed)} accent="danger" />
          <StatCard label="Total Order" value={String(adminOrders.length)} accent="gold" />
        </div>

        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">No. Order</th><th className="text-left px-6 py-3">User</th><th className="text-left px-6 py-3">Plan</th><th className="text-left px-6 py-3">Metode</th><th className="text-left px-6 py-3">Jumlah</th><th className="text-left px-6 py-3">Status</th><th className="text-left px-6 py-3">Tanggal</th></tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {adminOrders.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/30">
                  <td className="px-6 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-6 py-3 font-medium">{o.user}</td>
                  <td className="px-6 py-3 text-muted-foreground">{o.plan}</td>
                  <td className="px-6 py-3 text-muted-foreground">{o.method}</td>
                  <td className="px-6 py-3 font-medium">{rupiah(o.amount)}</td>
                  <td className="px-6 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-6 py-3 text-muted-foreground">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
