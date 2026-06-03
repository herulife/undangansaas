import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Topbar, StatCard, StatusPill } from "@/components/dashboard/Shared";
import { Download, RotateCcw } from "lucide-react";
import { listAdminOrders, refundPayment, type AdminOrder } from "@/lib/api";

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [message, setMessage] = useState("Memuat order dari database...");
  const [busyOrder, setBusyOrder] = useState("");

  const load = async () => {
    try {
      const data = await listAdminOrders();
      setOrders(data);
      setMessage(`${data.length} order dari database`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat order");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const paid = orders.filter((order) => order.status === "paid" || order.status === "settlement");
    return {
      total: paid.reduce((sum, order) => sum + order.amountIdr, 0),
      pending: orders.filter((order) => order.status === "pending").length,
      failed: orders.filter((order) => ["failed", "expired", "cancelled"].includes(order.status)).length,
      count: orders.length,
    };
  }, [orders]);

  const handleRefund = async (order: AdminOrder) => {
    setBusyOrder(order.id);
    setMessage(`Memproses refund ${order.providerOrderId || order.id}...`);
    try {
      await refundPayment({ orderId: order.providerOrderId || order.id, reason: "Admin manual override" });
      await load();
      setMessage("Refund berhasil dicatat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal refund order.");
    } finally {
      setBusyOrder("");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Order", "User", "Tier", "Provider", "Amount", "Status", "Created"],
      ...orders.map((order) => [
        order.providerOrderId || order.id,
        order.userEmail,
        order.tier,
        order.provider,
        String(order.amountIdr),
        order.status,
        order.createdAt,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "orders.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Topbar title="Orders & Payments" subtitle={message}>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md hairline px-3 py-2 text-sm hover:bg-secondary"><Download className="size-4" />Export</button>
      </Topbar>
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Paid" value={rupiah(stats.total)} accent="success" />
          <StatCard label="Pending" value={String(stats.pending)} accent="warning" />
          <StatCard label="Failed" value={String(stats.failed)} accent="danger" />
          <StatCard label="Total Order" value={String(stats.count)} accent="gold" />
        </div>

        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <div className="space-y-3 p-3 md:hidden">
            {orders.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada transaksi.</div>}
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl bg-secondary/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-gold">{order.providerOrderId || order.id}</p>
                    <p className="mt-1 truncate font-medium">{order.userName || order.userEmail}</p>
                    <p className="truncate text-xs text-muted-foreground">{order.userEmail}</p>
                  </div>
                  <StatusPill status={orderStatusLabel(order.status)} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Mini label="Plan" value={order.tier} />
                  <Mini label="Metode" value={order.provider} />
                  <Mini label="Total" value={rupiah(order.amountIdr)} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                  <button
                    onClick={() => handleRefund(order)}
                    disabled={!["paid", "settlement"].includes(order.status) || busyOrder === order.id}
                    className="inline-flex items-center gap-1 rounded-md hairline px-3 py-2 text-xs hover:bg-secondary disabled:opacity-40"
                  >
                    <RotateCcw className="size-3" />Refund
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left px-6 py-3">No. Order</th><th className="text-left px-6 py-3">User</th><th className="text-left px-6 py-3">Plan</th><th className="text-left px-6 py-3">Metode</th><th className="text-left px-6 py-3">Jumlah</th><th className="text-left px-6 py-3">Status</th><th className="text-left px-6 py-3">Tanggal</th><th className="text-right px-6 py-3">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-muted-foreground">Belum ada transaksi.</td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-3 font-mono text-xs">{order.providerOrderId || order.id}</td>
                    <td className="px-6 py-3">
                      <p className="font-medium">{order.userName || order.userEmail}</p>
                      <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                    </td>
                    <td className="px-6 py-3 capitalize text-muted-foreground">{order.tier}</td>
                    <td className="px-6 py-3 capitalize text-muted-foreground">{order.provider}</td>
                    <td className="px-6 py-3 font-medium">{rupiah(order.amountIdr)}</td>
                    <td className="px-6 py-3"><StatusPill status={orderStatusLabel(order.status)} /></td>
                    <td className="px-6 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleRefund(order)}
                        disabled={!["paid", "settlement"].includes(order.status) || busyOrder === order.id}
                        className="inline-flex items-center gap-1 rounded-md hairline px-2.5 py-1 text-xs hover:bg-secondary disabled:opacity-40"
                      >
                        <RotateCcw className="size-3" />Refund
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function orderStatusLabel(status: string) {
  if (status === "paid" || status === "settlement") return "Paid";
  if (status === "failed" || status === "cancelled") return "Failed";
  if (status === "expired") return "Expired";
  if (status === "refunded") return "Refunded";
  return "Pending";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/40 px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="truncate font-medium capitalize">{value}</p>
    </div>
  );
}
