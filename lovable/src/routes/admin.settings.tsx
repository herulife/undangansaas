import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Shared";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <>
      <Topbar title="Settings" subtitle="Konfigurasi platform" />
      <div className="p-6 max-w-4xl space-y-6">
        <section className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-xl mb-5">Info Brand</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nama Platform"><input defaultValue="Undanganku" className="admin-input" /></Field>
            <Field label="Email Support"><input defaultValue="halo@undanganku.id" className="admin-input" /></Field>
            <Field label="WhatsApp CS"><input defaultValue="+62 812-3456-7890" className="admin-input" /></Field>
            <Field label="Default Domain"><input defaultValue="undanganku.id" className="admin-input" /></Field>
          </div>
        </section>

        <section className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-xl mb-5">Pembayaran</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Midtrans Server Key"><input type="password" defaultValue="••••••••••" className="admin-input" /></Field>
            <Field label="Xendit API Key"><input type="password" defaultValue="••••••••••" className="admin-input" /></Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["QRIS","BCA","Mandiri","BRI","OVO","DANA","GoPay","Credit Card"].map((m) => (
              <label key={m} className="inline-flex items-center gap-2 rounded-full hairline px-3 py-1.5 text-xs">
                <input type="checkbox" defaultChecked className="accent-[oklch(0.78_0.13_80)]" /> {m}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-xl mb-5">Integrasi</h3>
          <div className="space-y-3">
            {[{n:"WhatsApp Gateway",v:"Connected"},{n:"SMTP / Email",v:"Connected"},{n:"Google Analytics",v:"Not connected"},{n:"Meta Pixel",v:"Not connected"}].map((i) => (
              <div key={i.n} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                <span className="text-sm">{i.n}</span>
                <span className={`text-xs ${i.v === "Connected" ? "text-emerald-300" : "text-muted-foreground"}`}>{i.v}</span>
              </div>
            ))}
          </div>
        </section>

        <button className="rounded-md bg-gold-gradient text-primary-foreground px-5 py-2 text-sm">Simpan Pengaturan</button>
      </div>
      <style>{`.admin-input{width:100%;border-radius:0.5rem;background:color-mix(in oklab, var(--secondary) 40%, transparent);border:1px solid color-mix(in oklab, var(--gold) 22%, transparent);padding:0.625rem 0.75rem;outline:none}.admin-input:focus{box-shadow:0 0 0 1px var(--gold)}`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</span>{children}</label>;
}
