import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Topbar, StatCard, StatusPill } from "@/components/dashboard/Shared";
import { Ban, CheckCircle2, Download, ExternalLink, Eye, RotateCcw, Search, X } from "lucide-react";
import { cancelPayment, listAdminOrders, refundPayment, verifyManualPayment, type AdminOrder } from "@/lib/api";

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

type OrderFilter = "all" | "manual-review" | "waiting-proof" | "gateway-pending" | "paid" | "closed";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [message, setMessage] = useState("Memuat order dari database...");
  const [busyOrder, setBusyOrder] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

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
    const paid = orders.filter(isPaidOrder);
    return {
      total: paid.reduce((sum, order) => sum + order.amountIdr, 0),
      review: orders.filter(canVerifyManual).length,
      pending: orders.filter((order) => order.status === "pending").length,
      failed: orders.filter(isClosedOrder).length,
      count: orders.length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "manual-review" && canVerifyManual(order)) ||
        (filter === "waiting-proof" && order.provider === "manual" && order.status === "pending" && !order.proofUrl) ||
        (filter === "gateway-pending" && order.provider !== "manual" && order.status === "pending") ||
        (filter === "paid" && isPaidOrder(order)) ||
        (filter === "closed" && isClosedOrder(order));

      if (!matchesFilter) return false;
      if (!query) return true;

      const haystack = [
        order.id,
        order.providerOrderId,
        order.userName,
        order.userEmail,
        order.provider,
        order.tier,
        order.status,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filter, orders, searchTerm]);

  const filterTabs: Array<{ id: OrderFilter; label: string; count: number }> = [
    { id: "all", label: "Semua", count: orders.length },
    { id: "manual-review", label: "Review Manual", count: stats.review },
    {
      id: "waiting-proof",
      label: "Menunggu Bukti",
      count: orders.filter((order) => order.provider === "manual" && order.status === "pending" && !order.proofUrl).length,
    },
    { id: "gateway-pending", label: "Gateway Pending", count: orders.filter((order) => order.provider !== "manual" && order.status === "pending").length },
    { id: "paid", label: "Lunas", count: orders.filter(isPaidOrder).length },
    { id: "closed", label: "Selesai/Gagal", count: orders.filter(isClosedOrder).length },
  ];

  const handleRefund = async (order: AdminOrder) => {
    setBusyOrder(order.id);
    setMessage(`Memproses refund ${orderNumber(order)}...`);
    try {
      await refundPayment({ orderId: orderNumber(order), reason: "Admin manual override" });
      await load();
      setSelectedOrder(null);
      setMessage("Refund berhasil dicatat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal refund order.");
    } finally {
      setBusyOrder("");
    }
  };

  const handleVerifyManual = async (order: AdminOrder) => {
    setBusyOrder(order.id);
    setMessage(`Memverifikasi pembayaran manual ${orderNumber(order)}...`);
    try {
      await verifyManualPayment(orderNumber(order));
      await load();
      setSelectedOrder(null);
      setMessage("Pembayaran manual berhasil diverifikasi dan paket user sudah aktif.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal verifikasi pembayaran manual.");
    } finally {
      setBusyOrder("");
    }
  };

  const handleCancel = async (order: AdminOrder) => {
    if (!window.confirm(`Batalkan order ${orderNumber(order)}? Order paid tidak akan ikut berubah.`)) {
      return;
    }
    setBusyOrder(order.id);
    setMessage(`Membatalkan order ${orderNumber(order)}...`);
    try {
      await cancelPayment(orderNumber(order), { reason: "Admin cancelled pending order" });
      await load();
      setSelectedOrder(null);
      setMessage("Order pending berhasil dibatalkan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal membatalkan order.");
    } finally {
      setBusyOrder("");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Order", "User", "Tier", "Provider", "Amount", "Status", "Created"],
      ...filteredOrders.map((order) => [
        orderNumber(order),
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
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md hairline px-3 py-2 text-sm hover:bg-secondary">
          <Download className="size-4" />Export
        </button>
      </Topbar>
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Total Paid" value={rupiah(stats.total)} accent="success" />
          <StatCard label="Review Manual" value={String(stats.review)} hint="Bukti masuk" accent="warning" />
          <StatCard label="Pending" value={String(stats.pending)} accent="info" />
          <StatCard label="Closed" value={String(stats.failed)} accent="danger" />
          <StatCard label="Total Order" value={String(stats.count)} accent="gold" />
        </div>

        <section className="rounded-2xl bg-card hairline">
          <div className="space-y-4 border-b border-border/50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-serif text-2xl">Daftar Order</h2>
                <p className="text-sm text-muted-foreground">Pantau transaksi gateway, transfer manual, dan order pending lama.</p>
              </div>
              <label className="flex w-full items-center gap-2 rounded-full hairline px-3 py-2 text-sm lg:w-80">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Cari order, user, provider..."
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </label>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
                    filter === tab.id
                      ? "border-gold bg-gold text-background"
                      : "border-border/70 bg-secondary/25 text-muted-foreground hover:border-gold/60 hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${filter === tab.id ? "bg-background/15" : "bg-background/40"}`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-3 md:hidden">
            {filteredOrders.length === 0 && <EmptyOrders />}
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-xl bg-secondary/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-gold">{orderNumber(order)}</p>
                    <p className="mt-1 truncate font-medium">{order.userName || order.userEmail}</p>
                    <p className="truncate text-xs text-muted-foreground">{order.userEmail}</p>
                  </div>
                  <StatusPill status={orderStatusLabel(order.status)} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Mini label="Plan" value={order.tier} />
                  <Mini label="Metode" value={<ProviderBadge provider={order.provider} />} />
                  <Mini label="Total" value={rupiah(order.amountIdr)} />
                </div>
                <ManualPaymentHint order={order} />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1 rounded-md hairline px-3 py-2 text-xs hover:bg-secondary"
                  >
                    <Eye className="size-3" />Detail
                  </button>
                </div>
                <OrderActions
                  order={order}
                  busy={busyOrder === order.id}
                  onVerify={handleVerifyManual}
                  onRefund={handleRefund}
                  onCancel={handleCancel}
                />
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left">No. Order</th>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-left">Provider</th>
                  <th className="px-6 py-3 text-left">Jumlah</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Manual</th>
                  <th className="px-6 py-3 text-left">Tanggal</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8">
                      <EmptyOrders />
                    </td>
                  </tr>
                )}
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-3">
                      <button onClick={() => setSelectedOrder(order)} className="font-mono text-xs text-gold underline-offset-4 hover:underline">
                        {orderNumber(order)}
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-medium">{order.userName || order.userEmail}</p>
                      <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                    </td>
                    <td className="px-6 py-3 capitalize text-muted-foreground">{order.tier}</td>
                    <td className="px-6 py-3">
                      <ProviderBadge provider={order.provider} />
                    </td>
                    <td className="px-6 py-3 font-medium">{rupiah(order.amountIdr)}</td>
                    <td className="px-6 py-3">
                      <StatusPill status={orderStatusLabel(order.status)} />
                    </td>
                    <td className="px-6 py-3">
                      <ManualPaymentHint order={order} compact />
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{formatDateTime(order.createdAt)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 rounded-md hairline px-2.5 py-1 text-xs hover:bg-secondary"
                        >
                          <Eye className="size-3" />Detail
                        </button>
                        <OrderActions
                          order={order}
                          busy={busyOrder === order.id}
                          onVerify={handleVerifyManual}
                          onRefund={handleRefund}
                          onCancel={handleCancel}
                          compact
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          busy={busyOrder === selectedOrder.id}
          onClose={() => setSelectedOrder(null)}
          onVerify={handleVerifyManual}
          onRefund={handleRefund}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

function OrderDetailModal({
  order,
  busy,
  onClose,
  onVerify,
  onRefund,
  onCancel,
}: {
  order: AdminOrder;
  busy: boolean;
  onClose: () => void;
  onVerify: (order: AdminOrder) => void;
  onRefund: (order: AdminOrder) => void;
  onCancel: (order: AdminOrder) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-background/75 backdrop-blur-sm md:items-center md:justify-center" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-card hairline shadow-elegant md:max-w-3xl md:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border/50 p-5">
          <div className="min-w-0">
            <p className="font-mono text-xs text-gold">{orderNumber(order)}</p>
            <h2 className="mt-1 font-serif text-2xl">Detail Invoice</h2>
            <p className="truncate text-sm text-muted-foreground">{order.userName || order.userEmail}</p>
          </div>
          <button onClick={onClose} className="inline-flex size-9 items-center justify-center rounded-full hairline text-muted-foreground hover:text-foreground" aria-label="Tutup detail invoice">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="User" value={order.userEmail} />
              <DetailItem label="Plan" value={order.tier} />
              <DetailItem label="Provider" value={<ProviderBadge provider={order.provider} />} />
              <DetailItem label="Status" value={<StatusPill status={orderStatusLabel(order.status)} />} />
              <DetailItem label="Jumlah" value={rupiah(order.amountIdr)} />
              <DetailItem label="Mata uang" value={order.currency} />
              <DetailItem label="Dibuat" value={formatDateTime(order.createdAt)} />
              <DetailItem label="Update" value={formatDateTime(order.updatedAt)} />
              <DetailItem label="Paid at" value={order.paidAt ? formatDateTime(order.paidAt) : "-"} />
              <DetailItem label="Verified at" value={order.verifiedAt ? formatDateTime(order.verifiedAt) : "-"} />
            </div>

            {order.checkoutUrl && (
              <a href={order.checkoutUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md hairline px-3 py-2 text-sm text-gold hover:bg-secondary">
                <ExternalLink className="size-4" />Buka link checkout
              </a>
            )}

            {order.manualNote && (
              <div className="rounded-xl bg-secondary/30 p-4">
                <p className="text-xs text-muted-foreground">Catatan user</p>
                <p className="mt-1 text-sm">{order.manualNote}</p>
              </div>
            )}
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl bg-secondary/30 p-4">
              <p className="text-xs text-muted-foreground">Bukti pembayaran</p>
              {order.proofUrl ? (
                <a href={order.proofUrl} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-lg border border-border/60">
                  <img src={order.proofUrl} alt="Bukti pembayaran" className="h-48 w-full object-cover" />
                </a>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Belum ada bukti upload.</p>
              )}
            </div>
            <OrderActions order={order} busy={busy} onVerify={onVerify} onRefund={onRefund} onCancel={onCancel} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function OrderActions({
  order,
  busy,
  onVerify,
  onRefund,
  onCancel,
  compact,
}: {
  order: AdminOrder;
  busy: boolean;
  onVerify: (order: AdminOrder) => void;
  onRefund: (order: AdminOrder) => void;
  onCancel: (order: AdminOrder) => void;
  compact?: boolean;
}) {
  const sizeClass = compact ? "px-2.5 py-1 text-xs" : "w-full justify-center px-3 py-2 text-sm";
  return (
    <div className={compact ? "flex gap-2" : "grid gap-2"}>
      <button
        onClick={() => onVerify(order)}
        disabled={!canVerifyManual(order) || busy}
        className={`inline-flex items-center gap-1 rounded-md hairline hover:bg-secondary disabled:opacity-40 ${sizeClass}`}
      >
        <CheckCircle2 className="size-3" />Verifikasi
      </button>
      <button
        onClick={() => onCancel(order)}
        disabled={order.status !== "pending" || busy}
        className={`inline-flex items-center gap-1 rounded-md hairline hover:bg-secondary disabled:opacity-40 ${sizeClass}`}
      >
        <Ban className="size-3" />Batalkan
      </button>
      <button
        onClick={() => onRefund(order)}
        disabled={!isPaidOrder(order) || busy}
        className={`inline-flex items-center gap-1 rounded-md hairline hover:bg-secondary disabled:opacity-40 ${sizeClass}`}
      >
        <RotateCcw className="size-3" />Refund
      </button>
    </div>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const map: Record<string, string> = {
    manual: "border-amber-500/30 bg-amber-500/15 text-amber-300",
    midtrans: "border-violet-500/30 bg-violet-500/15 text-violet-300",
    xendit: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] capitalize ${map[provider] ?? "border-border bg-muted text-muted-foreground"}`}>
      {provider || "unknown"}
    </span>
  );
}

function ManualPaymentHint({ order, compact }: { order: AdminOrder; compact?: boolean }) {
  if (order.provider !== "manual") {
    return compact ? <span className="text-xs text-muted-foreground">Gateway</span> : null;
  }
  if (canVerifyManual(order)) {
    return <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[11px] text-amber-300">Bukti masuk</span>;
  }
  if (order.status === "pending") {
    return <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">Menunggu bukti</span>;
  }
  return compact ? <span className="text-xs text-muted-foreground">-</span> : null;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-secondary/30 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="mt-1 break-words text-sm font-medium capitalize">{value}</div>
    </div>
  );
}

function orderStatusLabel(status: string) {
  if (status === "paid" || status === "settlement") return "Paid";
  if (status === "failed") return "Failed";
  if (status === "cancelled") return "Cancelled";
  if (status === "expired") return "Expired";
  if (status === "refunded") return "Refunded";
  return "Pending";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function canVerifyManual(order: AdminOrder) {
  return order.provider === "manual" && order.status === "pending" && Boolean(order.proofUrl);
}

function isPaidOrder(order: AdminOrder) {
  return order.status === "paid" || order.status === "settlement";
}

function isClosedOrder(order: AdminOrder) {
  return ["failed", "expired", "cancelled", "refunded"].includes(order.status);
}

function orderNumber(order: AdminOrder) {
  return order.providerOrderId || order.id;
}

function csvCell(value: string) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function EmptyOrders() {
  return <div className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada order yang cocok dengan filter ini.</div>;
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-background/40 px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <div className="truncate font-medium capitalize">{value}</div>
    </div>
  );
}
