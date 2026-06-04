import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import {
  getAdminPaymentGateways,
  updateAdminPaymentGateways,
  type AdminPaymentGatewayPayload,
  type AdminPaymentGatewaySettings,
  type ManualPaymentInstructions,
  type PaymentProvider,
} from "@/lib/api";
import { CheckCircle2, Copy, CreditCard, Landmark, Loader2, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/admin/payment-gateway")({
  component: PaymentGatewayPage,
});

const emptySettings: AdminPaymentGatewaySettings = {
  activeProvider: "manual",
  demoPaymentsAllowed: true,
  gateways: [],
  webhooks: {
    midtrans: "",
    xendit: "",
  },
};

function PaymentGatewayPage() {
  const [settings, setSettings] = useState<AdminPaymentGatewaySettings>(emptySettings);
  const [activeProvider, setActiveProvider] = useState<PaymentProvider>("manual");
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>("midtrans");
  const [demoPaymentsAllowed, setDemoPaymentsAllowed] = useState(true);
  const [manualBankName, setManualBankName] = useState("");
  const [manualAccountNumber, setManualAccountNumber] = useState("");
  const [manualAccountName, setManualAccountName] = useState("");
  const [manualQrisUrl, setManualQrisUrl] = useState("");
  const [manualWhatsApp, setManualWhatsApp] = useState("");
  const [manualInstructions, setManualInstructions] = useState("");
  const [midtransEnvironment, setMidtransEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [midtransMerchantId, setMidtransMerchantId] = useState("");
  const [midtransClientKey, setMidtransClientKey] = useState("");
  const [midtransServerKey, setMidtransServerKey] = useState("");
  const [midtransSnapUrl, setMidtransSnapUrl] = useState("");
  const [xenditApiKey, setXenditApiKey] = useState("");
  const [xenditCallbackToken, setXenditCallbackToken] = useState("");
  const [xenditInvoiceUrl, setXenditInvoiceUrl] = useState("");
  const [message, setMessage] = useState("Memuat konfigurasi payment...");
  const [busy, setBusy] = useState(false);

  const manual = useMemo(() => settings.gateways.find((gateway) => gateway.provider === "manual"), [settings.gateways]);
  const midtrans = useMemo(() => settings.gateways.find((gateway) => gateway.provider === "midtrans"), [settings.gateways]);
  const xendit = useMemo(() => settings.gateways.find((gateway) => gateway.provider === "xendit"), [settings.gateways]);
  const manualReady = Boolean(manualBankName.trim() && manualAccountNumber.trim()) || Boolean(manualQrisUrl.trim()) || Boolean(manual?.bankName && manual?.accountNumber) || Boolean(manual?.qrisUrl);

  const syncForm = (data: AdminPaymentGatewaySettings) => {
    const manualGateway = data.gateways.find((gateway) => gateway.provider === "manual");
    const midtransGateway = data.gateways.find((gateway) => gateway.provider === "midtrans");
    const xenditGateway = data.gateways.find((gateway) => gateway.provider === "xendit");
    setSettings(data);
    setActiveProvider(data.activeProvider);
    setSelectedProvider(providerFromURL() ?? data.activeProvider);
    setDemoPaymentsAllowed(data.demoPaymentsAllowed);
    setManualBankName(manualGateway?.bankName ?? "");
    setManualAccountNumber(manualGateway?.accountNumber ?? "");
    setManualAccountName(manualGateway?.accountName ?? "");
    setManualQrisUrl(manualGateway?.qrisUrl ?? "");
    setManualWhatsApp(manualGateway?.whatsApp ?? "");
    setManualInstructions(manualGateway?.instructions ?? "");
    setMidtransEnvironment(midtransGateway?.environment === "production" ? "production" : "sandbox");
    setMidtransMerchantId(midtransGateway?.merchantId ?? "");
    setMidtransClientKey(midtransGateway?.clientKey ?? "");
    setMidtransSnapUrl("");
    setMidtransServerKey("");
    setXenditInvoiceUrl(xenditGateway?.endpoint ?? "https://api.xendit.co/v2/invoices");
    setXenditApiKey("");
    setXenditCallbackToken("");
  };

  const load = async () => {
    try {
      const data = await getAdminPaymentGateways();
      syncForm(data);
      setMessage(`Gateway aktif: ${providerLabel(data.activeProvider)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat payment gateway.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    setBusy(true);
    setMessage("Menyimpan payment gateway...");
    const manualPayload: ManualPaymentInstructions = {
      bankName: manualBankName.trim(),
      accountNumber: manualAccountNumber.trim(),
      accountName: manualAccountName.trim(),
      qrisUrl: manualQrisUrl.trim(),
      whatsApp: manualWhatsApp.trim(),
      instructions: manualInstructions.trim(),
    };
    const payload: AdminPaymentGatewayPayload = {
      activeProvider,
      demoPaymentsAllowed,
      manual: manualPayload,
      midtrans: {
        environment: midtransEnvironment,
        merchantId: midtransMerchantId.trim(),
        clientKey: midtransClientKey.trim(),
        serverKey: midtransServerKey.trim() || undefined,
        snapUrl: midtransSnapUrl.trim() || undefined,
      },
      xendit: {
        apiKey: xenditApiKey.trim() || undefined,
        callbackToken: xenditCallbackToken.trim() || undefined,
        invoiceUrl: xenditInvoiceUrl.trim() || undefined,
      },
    };
    try {
      const data = await updateAdminPaymentGateways(payload);
      syncForm(data);
      setMessage(`Tersimpan. Gateway aktif: ${providerLabel(data.activeProvider)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan payment gateway.");
    } finally {
      setBusy(false);
    }
  };

  const openTab = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("gateway", provider);
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    }
  };

  const activateSelectedProvider = () => {
    setActiveProvider(selectedProvider);
    setMessage(`${providerLabel(selectedProvider)} dipilih sebagai gateway aktif. Klik Simpan untuk menerapkan.`);
  };

  return (
    <>
      <Topbar title="Payment Gateway" subtitle={message}>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-gold-gradient px-4 py-2 text-sm text-primary-foreground shadow-gold disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Simpan
        </button>
      </Topbar>

      <div className="space-y-5 p-4 md:p-6">
        <section className="rounded-2xl bg-card p-3 hairline">
          <div className="grid gap-2 md:grid-cols-3" role="tablist" aria-label="Payment gateway">
            <GatewayTab
              provider="midtrans"
              title="Midtrans"
              icon={CreditCard}
              activeProvider={activeProvider}
              selectedProvider={selectedProvider}
              configured={Boolean(midtrans?.serverKeySet)}
              onSelect={openTab}
            />
            <GatewayTab
              provider="xendit"
              title="Xendit"
              icon={WalletCards}
              activeProvider={activeProvider}
              selectedProvider={selectedProvider}
              configured={Boolean(xendit?.apiKeySet)}
              onSelect={openTab}
            />
            <GatewayTab
              provider="manual"
              title="Manual"
              icon={Landmark}
              activeProvider={activeProvider}
              selectedProvider={selectedProvider}
              configured={manualReady}
              onSelect={openTab}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 hairline">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold">Gateway Aktif</p>
              <h2 className="mt-1 font-serif text-2xl">{providerLabel(activeProvider)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tab terbuka: {providerLabel(selectedProvider)}. Perubahan gateway aktif baru berlaku setelah disimpan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-secondary/40 px-4 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={demoPaymentsAllowed}
                  onChange={(event) => setDemoPaymentsAllowed(event.target.checked)}
                  className="size-4 accent-[oklch(0.78_0.13_80)]"
                />
                Mode demo
              </label>
              <button
                type="button"
                onClick={activateSelectedProvider}
                disabled={activeProvider === selectedProvider}
                className="rounded-md hairline px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
              >
                {activeProvider === selectedProvider ? "Sedang Aktif" : `Jadikan ${providerLabel(selectedProvider)} Aktif`}
              </button>
            </div>
          </div>
        </section>

        {selectedProvider === "manual" && (
          <section className="rounded-2xl bg-card p-5 hairline" role="tabpanel" aria-label="Konfigurasi Manual">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold">Manual Transfer / QRIS</p>
                <h2 className="mt-1 font-serif text-2xl">Konfigurasi Manual</h2>
              </div>
              <StatusPill status={manualReady ? "Ready" : "Pending"} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nama Bank">
                <input value={manualBankName} onChange={(event) => setManualBankName(event.target.value)} className="admin-input" placeholder="BCA / Mandiri / BRI" />
              </Field>
              <Field label="Nomor Rekening">
                <input value={manualAccountNumber} onChange={(event) => setManualAccountNumber(event.target.value)} className="admin-input" placeholder="1234567890" />
              </Field>
              <Field label="Nama Pemilik">
                <input value={manualAccountName} onChange={(event) => setManualAccountName(event.target.value)} className="admin-input" placeholder="PT / Nama pemilik rekening" />
              </Field>
              <Field label="WhatsApp Admin">
                <input value={manualWhatsApp} onChange={(event) => setManualWhatsApp(event.target.value)} className="admin-input" placeholder="62812..." />
              </Field>
              <Field label="URL QRIS">
                <input value={manualQrisUrl} onChange={(event) => setManualQrisUrl(event.target.value)} className="admin-input" placeholder="/api/uploads/images/qris.png atau https://..." />
              </Field>
              <Field label="Instruksi Pembayaran">
                <textarea value={manualInstructions} onChange={(event) => setManualInstructions(event.target.value)} className="admin-input min-h-24" placeholder="Transfer sesuai nominal invoice, lalu upload bukti pembayaran." />
              </Field>
            </div>
          </section>
        )}

        {selectedProvider === "midtrans" && (
          <section className="rounded-2xl bg-card p-5 hairline" role="tabpanel" aria-label="Konfigurasi Midtrans">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold">Midtrans Snap</p>
                <h2 className="mt-1 font-serif text-2xl">Konfigurasi Midtrans</h2>
              </div>
              <StatusPill status={midtrans?.serverKeySet ? "Connected" : "Pending"} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Environment">
                <select value={midtransEnvironment} onChange={(event) => setMidtransEnvironment(event.target.value as "sandbox" | "production")} className="admin-input">
                  <option value="sandbox">Sandbox</option>
                  <option value="production">Production</option>
                </select>
              </Field>
              <Field label="Merchant ID">
                <input value={midtransMerchantId} onChange={(event) => setMidtransMerchantId(event.target.value)} className="admin-input" placeholder="G..." />
              </Field>
              <Field label="Client Key">
                <input value={midtransClientKey} onChange={(event) => setMidtransClientKey(event.target.value)} className="admin-input" placeholder="Mid-client atau SB-Mid-client" />
              </Field>
              <Field label={midtrans?.serverKeySet ? "Server Key Baru" : "Server Key"}>
                <input type="password" value={midtransServerKey} onChange={(event) => setMidtransServerKey(event.target.value)} className="admin-input" placeholder={midtrans?.serverKeySet ? "Kosongkan jika tidak diganti" : "Mid-server atau SB-Mid-server"} />
              </Field>
              <Field label="Snap Endpoint Override">
                <input value={midtransSnapUrl} onChange={(event) => setMidtransSnapUrl(event.target.value)} className="admin-input" placeholder={midtrans?.endpoint || "Auto sesuai environment"} />
              </Field>
              <WebhookField label="Webhook URL" value={settings.webhooks.midtrans} />
            </div>
          </section>
        )}

        {selectedProvider === "xendit" && (
          <section className="rounded-2xl bg-card p-5 hairline" role="tabpanel" aria-label="Konfigurasi Xendit">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold">Xendit Invoice</p>
                <h2 className="mt-1 font-serif text-2xl">Konfigurasi Xendit</h2>
              </div>
              <StatusPill status={xendit?.apiKeySet ? "Connected" : "Pending"} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={xendit?.apiKeySet ? "API Key Baru" : "API Key"}>
                <input type="password" value={xenditApiKey} onChange={(event) => setXenditApiKey(event.target.value)} className="admin-input" placeholder={xendit?.apiKeySet ? "Kosongkan jika tidak diganti" : "xnd_development atau xnd_production"} />
              </Field>
              <Field label={xendit?.callbackTokenSet ? "Callback Token Baru" : "Callback Token"}>
                <input type="password" value={xenditCallbackToken} onChange={(event) => setXenditCallbackToken(event.target.value)} className="admin-input" placeholder={xendit?.callbackTokenSet ? "Kosongkan jika tidak diganti" : "Token webhook Xendit"} />
              </Field>
              <Field label="Invoice Endpoint">
                <input value={xenditInvoiceUrl} onChange={(event) => setXenditInvoiceUrl(event.target.value)} className="admin-input" placeholder="https://api.xendit.co/v2/invoices" />
              </Field>
              <WebhookField label="Webhook URL" value={settings.webhooks.xendit} />
            </div>
          </section>
        )}
      </div>

      <style>{`.admin-input{width:100%;border-radius:0.5rem;background:color-mix(in oklab, var(--secondary) 40%, transparent);border:1px solid color-mix(in oklab, var(--gold) 22%, transparent);padding:0.625rem 0.75rem;outline:none}.admin-input:focus{box-shadow:0 0 0 1px var(--gold)}`}</style>
    </>
  );
}

function GatewayTab({
  provider,
  title,
  icon: Icon,
  activeProvider,
  selectedProvider,
  configured,
  onSelect,
}: {
  provider: PaymentProvider;
  title: string;
  icon: typeof CreditCard;
  activeProvider: PaymentProvider;
  selectedProvider: PaymentProvider;
  configured: boolean;
  onSelect: (provider: PaymentProvider) => void;
}) {
  const selected = selectedProvider === provider;
  const active = activeProvider === provider;
  return (
    <button
      type="button"
      onClick={() => onSelect(provider)}
      role="tab"
      aria-selected={selected}
      className={`rounded-xl p-4 text-left transition ${selected ? "bg-gold/10 ring-1 ring-gold/40" : "hover:bg-secondary/40"}`}
    >
      <div className="flex items-center gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${selected ? "bg-gold text-primary" : "bg-secondary/60 text-muted-foreground"}`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-xl">{title}</h3>
          <p className="truncate text-xs text-muted-foreground">{active ? "Gateway aktif" : configured ? "Siap dipilih" : "Belum lengkap"}</p>
        </div>
        <StatusPill status={active ? "Active" : configured ? "Ready" : "Pending"} />
      </div>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function WebhookField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input value={value} readOnly className="admin-input font-mono text-xs" />
        <button
          type="button"
          onClick={() => value && navigator.clipboard?.writeText(value)}
          className="grid size-10 shrink-0 place-items-center rounded-md hairline text-muted-foreground hover:text-foreground"
          aria-label="Salin webhook URL"
        >
          <Copy className="size-4" />
        </button>
      </div>
    </Field>
  );
}

function providerLabel(provider: string) {
  if (provider === "midtrans") return "Midtrans";
  if (provider === "xendit") return "Xendit";
  return "Manual";
}

function providerFromURL(): PaymentProvider | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("gateway");
  if (value === "manual" || value === "midtrans" || value === "xendit") return value;
  return null;
}
