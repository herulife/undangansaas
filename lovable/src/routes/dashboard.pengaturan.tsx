import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Shared";
import { changePassword, getMe, getStoredUser, updateProfile } from "@/lib/api";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

export const Route = createFileRoute("/dashboard/pengaturan")({
  component: SettingsPage,
});

function SettingsPage() {
  const storedUser = useMemo(() => getStoredUser(), []);
  const [displayName, setDisplayName] = useState(storedUser?.displayName ?? "");
  const [email, setEmail] = useState(storedUser?.email ?? "");
  const [profileStatus, setProfileStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const initials = (displayName || email || "U").slice(0, 1).toUpperCase();

  useEffect(() => {
    getMe()
      .then((user) => {
        setDisplayName(user.displayName);
        setEmail(user.email);
      })
      .catch(() => undefined);
  }, []);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileStatus("");
    setSavingProfile(true);
    try {
      const user = await updateProfile({ displayName, email });
      setDisplayName(user.displayName);
      setEmail(user.email);
      setProfileStatus("Profil berhasil diperbarui.");
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : "Gagal memperbarui profil.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus("");
    if (newPassword !== confirmPassword) {
      setPasswordStatus("Konfirmasi password baru belum sama.");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus("Password berhasil diubah.");
    } catch (error) {
      setPasswordStatus(error instanceof Error ? error.message : "Gagal mengubah password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <Topbar title="Pengaturan" subtitle="Profil & preferensi akun" />
      <div className="p-6 max-w-3xl space-y-6">
        <form onSubmit={handleProfileSubmit} className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-xl mb-5">Profil</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="size-16 rounded-full bg-gold-gradient flex items-center justify-center text-primary-foreground font-serif text-2xl">{initials}</div>
            <p className="text-sm text-muted-foreground">Foto profil akan disambungkan setelah fitur upload media aktif.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nama Lengkap">
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="input" required />
            </Field>
            <Field label="Email">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" required />
            </Field>
          </div>
          {profileStatus && <p className="mt-4 text-sm text-muted-foreground">{profileStatus}</p>}
          <button disabled={savingProfile} className="mt-5 rounded-md bg-gold-gradient text-primary-foreground px-5 py-2 text-sm disabled:opacity-60">
            {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-xl mb-5">Keamanan</h3>
          <div className="space-y-4">
            <Field label="Password Lama">
              <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="input" minLength={8} required />
            </Field>
            <Field label="Password Baru">
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="input" minLength={8} required />
            </Field>
            <Field label="Konfirmasi Password Baru">
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input" minLength={8} required />
            </Field>
          </div>
          {passwordStatus && <p className="mt-4 text-sm text-muted-foreground">{passwordStatus}</p>}
          <button disabled={savingPassword} className="mt-5 rounded-md hairline px-5 py-2 text-sm hover:bg-secondary disabled:opacity-60">
            {savingPassword ? "Mengubah..." : "Ubah Password"}
          </button>
        </form>

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

function Field({ label, children }: { label: string; children: ReactNode }) {
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
