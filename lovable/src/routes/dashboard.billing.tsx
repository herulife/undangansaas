import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { Check } from "lucide-react";
import { useState } from "react";
import { useTierGate } from "@/hooks/use-tier-gate";
import { createPaymentCheckout, demoSettlePayment, trackEvent, type AuthUser, type PaymentCheckoutResponse } from "@/lib/api";

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

const plans: Array<{
  name: string;
  key: AuthUser["tier"];
  price: string;
  note: string;
  checkoutTier?: "creator" | "pro" | "business";
}> = [
  { name: "Free", key: "free", price: "Rp0", note: "Watermark, 3 foto, RSVP 50" },
  { name: "Creator", key: "creator", price: "Rp39k", note: "Tanpa watermark, CSV, 15 foto", checkoutTier: "creator" },
  { name: "Pro", key: "pro", price: "Rp79k", note: "Custom domain, OG, galeri unlimited", checkoutTier: "pro" },
  { name: "Business", key: "business", price: "Rp199k/bln", note: "White-label, API, client dashboard", checkoutTier: "business" },
];

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

function BillingPage() {
  const tierGate = useTierGate();
  const [voucherCode, setVoucherCode] = useState("");
  const [busyTier, setBusyTier] = useState<AuthUser["tier"] | "">("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<PaymentCheckoutResponse[]>([]);
  const activeTier = tierGate.tier;
  const tierExpiresAt = tierGate.data?.tierExpiresAt
    ? new Date(tierGate.data.tierExpiresAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    : "Tidak ada tanggal expired";

  const handleUpgrade = async (tier: "creator" | "pro" | "business") => {
    setBusyTier(tier);
    setMessage("Membuat invoice pembayaran...");
    try {
      const checkout = await createPaymentCheckout({
        tier,
        provider: "manual",
        voucherCode: voucherCode.trim() || undefined,
      });
      setHistory((items) => [checkout, ...items]);
      void trackEvent({ eventName: "upgrade_click", properties: { tier, amountIdr: checkout.amountIdr } }).catch(() => undefined);

      if (checkout.demoSettleAllowed) {
        setMessage("Mode demo aktif, memproses settlement otomatis...");
        await demoSettlePayment(checkout.orderId);
        await tierGate.reload();
        setHistory((items) => items.map((item) => (item.orderId === checkout.orderId ? { ...item, status: "paid" } : item)));
        setMessage(`Paket ${tier} aktif. Tier sudah diperbarui dari backend.`);
        return;
      }

      setMessage("Redirect ke halaman pembayaran...");
      window.location.href = checkout.checkoutUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal membuat pembayaran.");
    } finally {
      setBusyTier("");
    }
  };

  return (
    <>
      <Topbar title="Billing & Paket" subtitle={message || tierGate.error || "Kelola paket, invoice, dan batas fitur"} />
      <div className="p-6 space-y-6">
        <div className="rounded-2xl p-6 bg-card hairline relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ backgroundImage: "var(--gradient-hero)" }} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold">Paket Saat Ini</p>
              <h2 className="font-serif text-3xl mt-1 capitalize">{activeTier}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {tierGate.loading ? "Memuat paket..." : `Berlaku sampai ${tierExpiresAt}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                value={voucherCode}
                onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                placeholder="Kode voucher"
                className="w-36 rounded-full hairline bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => handleUpgrade("business")}
                disabled={busyTier === "business" || activeTier === "business"}
                className="rounded-full bg-gold-gradient text-primary-foreground px-5 py-2 text-sm shadow-gold disabled:opacity-50"
              >
                Upgrade ke Business
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-5 ${activeTier === plan.key ? "bg-card ring-1 ring-gold/40" : "bg-card hairline"}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl">{plan.name}</h3>
                {activeTier === plan.key && (
                  <span className="text-xs text-gold inline-flex items-center gap-1">
                    <Check className="size-3" />Aktif
                  </span>
                )}
              </div>
              <p className="font-serif text-2xl mt-2">{plan.price}</p>
              <p className="mt-1 min-h-10 text-xs text-muted-foreground">{plan.note}</p>
              <button
                disabled={activeTier === plan.key || !plan.checkoutTier || busyTier === plan.key}
                onClick={() => plan.checkoutTier && handleUpgrade(plan.checkoutTier)}
                className="mt-4 w-full rounded-md hairline px-3 py-2 text-sm disabled:opacity-50"
              >
                {activeTier === plan.key ? "Paket Aktif" : busyTier === plan.key ? "Memproses..." : plan.checkoutTier ? "Pilih" : "Gratis"}
              </button>
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
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Belum ada invoice sesi ini. Order lama bisa dilihat admin di menu Orders.
                  </td>
                </tr>
              )}
              {history.map((item) => (
                <tr key={item.orderId} className="hover:bg-secondary/30">
                  <td className="px-6 py-3 font-mono text-xs">{item.orderId}</td>
                  <td className="px-6 py-3 capitalize">Upgrade {item.tier}</td>
                  <td className="px-6 py-3 text-muted-foreground">Baru dibuat</td>
                  <td className="px-6 py-3 font-medium">{rupiah(item.amountIdr)}</td>
                  <td className="px-6 py-3"><StatusPill status={paymentStatusLabel(item.status)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function paymentStatusLabel(status: string) {
  if (status === "paid" || status === "settlement") return "Paid";
  if (status === "failed" || status === "cancelled") return "Failed";
  if (status === "expired") return "Expired";
  return "Pending";
}
