import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { Check, Copy, MessageCircle, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useTierGate } from "@/hooks/use-tier-gate";
import {
  createPaymentCheckout,
  demoSettlePayment,
  getPaymentOrder,
  submitPaymentProof,
  trackEvent,
  uploadMedia,
  type AuthUser,
  type PaymentCheckoutResponse,
} from "@/lib/api";

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
  const [manualOrder, setManualOrder] = useState<PaymentCheckoutResponse | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofNote, setProofNote] = useState("");
  const [proofBusy, setProofBusy] = useState(false);
  const activeTier = tierGate.tier;
  const tierExpiresAt = tierGate.data?.tierExpiresAt
    ? new Date(tierGate.data.tierExpiresAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    : "Tidak ada tanggal expired";

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("order");
    if (!orderId) return;
    let alive = true;
    setMessage("Memuat invoice pembayaran...");
    getPaymentOrder(orderId)
      .then((order) => {
        if (!alive) return;
        setHistory((items) => upsertHistory(order, items));
        if (order.mode === "manual") {
          setManualOrder(order);
          setMessage(order.proofUrl ? "Bukti pembayaran sudah diterima. Menunggu verifikasi admin." : "Invoice manual siap dibayar.");
        } else {
          setMessage(`Status pembayaran: ${paymentStatusLabel(order.status)}`);
        }
      })
      .catch((error) => alive && setMessage(error instanceof Error ? error.message : "Gagal memuat invoice."))
      .finally(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const handleUpgrade = async (tier: "creator" | "pro" | "business") => {
    setBusyTier(tier);
    setMessage("Membuat invoice pembayaran...");
    try {
      const checkout = await createPaymentCheckout({
        tier,
        voucherCode: voucherCode.trim() || undefined,
      });
      setHistory((items) => upsertHistory(checkout, items));
      void trackEvent({ eventName: "upgrade_click", properties: { tier, amountIdr: checkout.amountIdr } }).catch(() => undefined);

      if (checkout.mode === "manual") {
        setManualOrder(checkout);
        setMessage("Invoice manual dibuat. Transfer sesuai instruksi lalu upload bukti pembayaran.");
        window.history.replaceState(null, "", `/dashboard/billing?order=${encodeURIComponent(checkout.orderId)}&provider=manual`);
        return;
      }

      if (checkout.demoSettleAllowed) {
        setMessage(`Mode demo aktif untuk ${providerLabel(checkout.provider)}, memproses otomatis...`);
        await demoSettlePayment(checkout.orderId);
        await tierGate.reload();
        setHistory((items) => items.map((item) => (item.orderId === checkout.orderId ? { ...item, status: "paid" } : item)));
        setMessage(`Paket ${tier} aktif. Tier sudah diperbarui dari backend.`);
        return;
      }

      setMessage(`Membuka halaman pembayaran ${providerLabel(checkout.provider)}...`);
      window.location.href = checkout.checkoutUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal membuat pembayaran.");
    } finally {
      setBusyTier("");
    }
  };

  const handleSubmitProof = async () => {
    if (!manualOrder) return;
    if (!proofFile) {
      setMessage("Pilih gambar bukti pembayaran dulu.");
      return;
    }
    setProofBusy(true);
    setMessage("Mengupload bukti pembayaran...");
    try {
      const upload = await uploadMedia(proofFile);
      const order = await submitPaymentProof(manualOrder.orderId, {
        proofUrl: upload.url,
        note: proofNote.trim() || undefined,
      });
      setManualOrder(order);
      setHistory((items) => upsertHistory(order, items));
      setMessage("Bukti pembayaran terkirim. Admin akan memverifikasi order ini.");
      setProofFile(null);
      setProofNote("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal upload bukti pembayaran.");
    } finally {
      setProofBusy(false);
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

        {manualOrder && (
          <ManualPaymentPanel
            order={manualOrder}
            proofFile={proofFile}
            proofNote={proofNote}
            proofBusy={proofBusy}
            onProofFile={setProofFile}
            onProofNote={setProofNote}
            onSubmitProof={handleSubmitProof}
          />
        )}

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

function ManualPaymentPanel({
  order,
  proofFile,
  proofNote,
  proofBusy,
  onProofFile,
  onProofNote,
  onSubmitProof,
}: {
  order: PaymentCheckoutResponse;
  proofFile: File | null;
  proofNote: string;
  proofBusy: boolean;
  onProofFile: (file: File | null) => void;
  onProofNote: (value: string) => void;
  onSubmitProof: () => void;
}) {
  const instructions = order.manualInstructions;
  const whatsAppURL = instructions?.whatsApp ? `https://wa.me/${normalizePhone(instructions.whatsApp)}?text=${encodeURIComponent(`Halo admin, saya sudah melakukan pembayaran order ${order.orderId}.`)}` : "";
  const canUpload = order.status === "pending";

  return (
    <section className="rounded-2xl bg-card p-5 hairline">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold">Pembayaran Manual</p>
          <h3 className="mt-1 font-serif text-2xl">Invoice {order.orderId}</h3>
          <p className="mt-1 text-sm text-muted-foreground">Transfer tepat sesuai nominal, lalu upload bukti pembayaran.</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl">{rupiah(order.amountIdr)}</p>
          <StatusPill status={paymentStatusLabel(order.status)} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-3 rounded-xl bg-secondary/30 p-4">
          <ManualInfo label="Bank" value={instructions?.bankName || "Belum diatur admin"} />
          <ManualInfo label="Nomor Rekening" value={instructions?.accountNumber || "Belum diatur admin"} copyable />
          <ManualInfo label="Nama Pemilik" value={instructions?.accountName || "Belum diatur admin"} />
          {instructions?.instructions && <p className="rounded-lg bg-background/50 p-3 text-sm text-muted-foreground">{instructions.instructions}</p>}
          {whatsAppURL && (
            <a href={whatsAppURL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md hairline px-3 py-2 text-sm hover:bg-secondary">
              <MessageCircle className="size-4" />Hubungi Admin
            </a>
          )}
        </div>

        <div className="space-y-3">
          {instructions?.qrisUrl && (
            <div className="rounded-xl bg-secondary/30 p-4">
              <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">QRIS</p>
              <img src={instructions.qrisUrl} alt="QRIS pembayaran manual" className="max-h-56 w-full rounded-lg object-contain bg-white p-3" />
            </div>
          )}
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Bukti Pembayaran</p>
            {order.proofUrl ? (
              <div className="mt-3 rounded-lg bg-background/50 p-3 text-sm">
                <p className="font-medium">Bukti sudah dikirim.</p>
                <a href={order.proofUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-gold underline-offset-4 hover:underline">Lihat bukti pembayaran</a>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  disabled={!canUpload || proofBusy}
                  onChange={(event) => onProofFile(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-md hairline bg-background/40 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-primary"
                />
                {proofFile && <p className="text-xs text-muted-foreground">{proofFile.name}</p>}
                <textarea
                  value={proofNote}
                  disabled={!canUpload || proofBusy}
                  onChange={(event) => onProofNote(event.target.value)}
                  placeholder="Catatan opsional, misalnya nama pengirim rekening"
                  className="w-full rounded-md hairline bg-background/40 px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={onSubmitProof}
                  disabled={!canUpload || proofBusy}
                  className="inline-flex items-center gap-2 rounded-md bg-gold-gradient px-4 py-2 text-sm text-primary-foreground shadow-gold disabled:opacity-50"
                >
                  <Upload className="size-4" />{proofBusy ? "Mengupload..." : "Upload Bukti"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ManualInfo({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-background/50 p-3">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
      {copyable && value && !value.includes("Belum") && (
        <button type="button" onClick={() => navigator.clipboard?.writeText(value)} className="grid size-9 shrink-0 place-items-center rounded-md hairline text-muted-foreground hover:text-foreground" aria-label={`Salin ${label}`}>
          <Copy className="size-4" />
        </button>
      )}
    </div>
  );
}

function upsertHistory(order: PaymentCheckoutResponse, items: PaymentCheckoutResponse[]) {
  const without = items.filter((item) => item.orderId !== order.orderId);
  return [order, ...without];
}

function paymentStatusLabel(status: string) {
  if (status === "paid" || status === "settlement") return "Paid";
  if (status === "failed" || status === "cancelled") return "Failed";
  if (status === "expired") return "Expired";
  return "Pending";
}

function providerLabel(provider: string) {
  if (provider === "midtrans") return "Midtrans";
  if (provider === "xendit") return "Xendit";
  return "Manual";
}

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "").replace(/^0/, "62");
}
