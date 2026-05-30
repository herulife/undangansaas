import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Shared";

export const Route = createFileRoute("/dashboard/pengaturan")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <Topbar title="Pengaturan" subtitle="Profil & preferensi akun" />
      <div className="p-6 max-w-3xl space-y-6">
        <section className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-xl mb-5">Profil</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="size-16 rounded-full bg-gold-gradient flex items-center justify-center text-primary-foreground font-serif text-2xl">R</div>
            <button className="rounded-md hairline px-3 py-1.5 text-sm hover:bg-secondary">Ganti Foto</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nama Lengkap"><input defaultValue="Rara Wijaya" className="input" /></Field>
            <Field label="Email"><input defaultValue="rara@mail.com" className="input" /></Field>
            <Field label="No. WhatsApp"><input defaultValue="0812-1111-2222" className="input" /></Field>
            <Field label="Tanggal Lahir"><input type="date" defaultValue="1995-04-22" className="input" /></Field>
          </div>
          <button className="mt-5 rounded-md bg-gold-gradient text-primary-foreground px-5 py-2 text-sm">Simpan Perubahan</button>
        </section>

        <section className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-xl mb-5">Keamanan</h3>
          <div className="space-y-4">
            <Field label="Password Lama"><input type="password" placeholder="••••••••" className="input" /></Field>
            <Field label="Password Baru"><input type="password" placeholder="••••••••" className="input" /></Field>
          </div>
          <button className="mt-5 rounded-md hairline px-5 py-2 text-sm hover:bg-secondary">Ubah Password</button>
        </section>

        <section className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-xl mb-5">Notifikasi</h3>
          <Toggle label="Email saat RSVP baru" defaultChecked />
          <Toggle label="WhatsApp saat undangan dibuka" />
          <Toggle label="Newsletter & promo" defaultChecked />
        </section>

        <section className="rounded-2xl bg-card hairline p-6 border border-rose-500/30">
          <h3 className="font-serif text-xl text-rose-300 mb-2">Zona Berbahaya</h3>
          <p className="text-sm text-muted-foreground mb-4">Menghapus akun tidak dapat dibatalkan.</p>
          <button className="rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 px-4 py-2 text-sm hover:bg-rose-500/25">Hapus Akun</button>
        </section>
      </div>
      <style>{`.input{width:100%;border-radius:0.5rem;background:color-mix(in oklab, var(--secondary) 40%, transparent);border:1px solid color-mix(in oklab, var(--gold) 22%, transparent);padding:0.625rem 0.75rem;outline:none}.input:focus{box-shadow:0 0 0 1px var(--gold)}`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</span>{children}</label>;
}
function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="accent-[oklch(0.78_0.13_80)] size-4" />
    </label>
  );
}
