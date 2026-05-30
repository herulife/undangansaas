import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import {
  createAdminUser,
  listAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
  type AdminUser,
  type AdminUserPayload,
} from "@/lib/api";
import { Filter, Loader2, Plus, RefreshCcw, Save, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const blankForm: AdminUserPayload & { password: string } = {
  email: "",
  displayName: "",
  password: "",
  role: "user",
  tier: "free",
  status: "active",
  tierExpiresAt: "",
  isB2b: false,
  clientLimit: 1,
};

function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(blankForm);
  const [password, setPassword] = useState("");

  const subtitle = useMemo(() => {
    if (loading) return "Memuat users dari database...";
    return `${users.length} users dari database`;
  }, [loading, users.length]);

  const loadUsers = async () => {
    setLoading(true);
    setMessage("");
    try {
      setUsers(await listAdminUsers({ q: query, status }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setSelected(null);
    setPassword("");
    setForm(blankForm);
  };

  const startEdit = (user: AdminUser) => {
    setSelected(user);
    setPassword("");
    setForm({
      email: user.email,
      displayName: user.displayName,
      password: "",
      role: user.role,
      tier: user.tier,
      status: user.status,
      tierExpiresAt: user.tierExpiresAt ? user.tierExpiresAt.slice(0, 10) : "",
      isB2b: user.isB2b,
      clientLimit: user.clientLimit,
    });
  };

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      if (selected) {
        const updated = await updateAdminUser(selected.id, form);
        setUsers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
        setSelected(updated);
        setMessage("User berhasil diperbarui.");
        return;
      }

      const created = await createAdminUser({ ...form, password: form.password });
      setUsers((items) => [created, ...items]);
      setSelected(created);
      setPassword("");
      setForm({ ...blankForm, email: created.email, displayName: created.displayName, role: created.role, tier: created.tier, status: created.status, clientLimit: created.clientLimit });
      setMessage("User baru berhasil dibuat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan user");
    }
  };

  const resetPassword = async () => {
    if (!selected) return;
    setMessage("");
    try {
      await resetAdminUserPassword(selected.id, password);
      setPassword("");
      setMessage("Password user berhasil direset.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal reset password");
    }
  };

  return (
    <>
      <Topbar title="Kelola Users" subtitle={message || subtitle}>
        <button onClick={loadUsers} className="inline-flex items-center gap-2 rounded-md hairline px-3 py-2 text-sm hover:bg-secondary">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
          Reload
        </button>
        <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-md bg-gold-gradient px-3 py-2 text-sm text-primary-foreground shadow-gold">
          <Plus className="size-4" />Tambah User
        </button>
      </Topbar>

      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-card p-3 hairline">
            <div className="flex min-w-64 flex-1 items-center gap-2 rounded-md bg-secondary/40 px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau email" className="w-full bg-transparent text-sm outline-none" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-md bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
              <Filter className="size-4" />
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="bg-transparent outline-none">
                <option value="">Semua status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <button onClick={loadUsers} className="rounded-md hairline px-4 py-2 text-sm hover:bg-secondary">Terapkan</button>
          </div>

          <div className="overflow-hidden rounded-lg bg-card hairline">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <Th>Nama</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Plan</Th>
                    <Th>Undangan</Th>
                    <Th>RSVP</Th>
                    <Th>Joined</Th>
                    <Th>Status</Th>
                    <Th align="right">Aksi</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary/30">
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-gold/20 text-xs font-medium text-gold">{initial(user.displayName, user.email)}</div>
                          <span className="font-medium">{user.displayName || "-"}</span>
                        </div>
                      </Td>
                      <Td className="text-muted-foreground">{user.email}</Td>
                      <Td>{user.role}</Td>
                      <Td><span className="text-xs text-gold">{user.tier}</span></Td>
                      <Td>{user.invitationCount}</Td>
                      <Td>{user.rsvpCount}</Td>
                      <Td className="text-muted-foreground">{formatDate(user.createdAt)}</Td>
                      <Td><StatusPill status={user.status === "active" ? "Active" : "Suspended"} /></Td>
                      <Td align="right">
                        <button onClick={() => startEdit(user)} className="text-xs text-gold hover:underline">Detail</button>
                      </Td>
                    </tr>
                  ))}
                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-sm text-muted-foreground">Tidak ada user sesuai filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="rounded-lg bg-card p-5 hairline">
          <h2 className="font-serif text-xl">{selected ? "Detail User" : "Tambah User"}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{selected ? selected.id : "Buat akun baru langsung dari admin."}</p>

          <form onSubmit={saveUser} className="mt-5 space-y-4">
            <Field label="Nama">
              <input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} className="field" required />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field" required />
            </Field>
            {!selected && (
              <Field label="Password Awal">
                <input type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field" required />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as AdminUserPayload["role"] })} className="field">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                  <option value="reseller">reseller</option>
                  <option value="client">client</option>
                </select>
              </Field>
              <Field label="Tier">
                <select value={form.tier} onChange={(event) => setForm({ ...form, tier: event.target.value as AdminUserPayload["tier"] })} className="field">
                  <option value="free">free</option>
                  <option value="creator">creator</option>
                  <option value="pro">pro</option>
                  <option value="business">business</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AdminUserPayload["status"] })} className="field">
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                </select>
              </Field>
              <Field label="Limit Client">
                <input type="number" min={0} value={form.clientLimit} onChange={(event) => setForm({ ...form, clientLimit: Number(event.target.value) })} className="field" />
              </Field>
            </div>
            <Field label="Tier Expired">
              <input type="date" value={form.tierExpiresAt} onChange={(event) => setForm({ ...form, tierExpiresAt: event.target.value })} className="field" />
            </Field>
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={form.isB2b} onChange={(event) => setForm({ ...form, isB2b: event.target.checked })} className="accent-[oklch(0.78_0.13_80)]" />
              B2B / reseller client
            </label>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold-gradient px-4 py-2 text-sm text-primary-foreground shadow-gold">
              <Save className="size-4" />Simpan User
            </button>
          </form>

          {selected && (
            <div className="mt-6 border-t border-border/50 pt-5">
              <h3 className="font-serif text-lg">Reset Password</h3>
              <p className="mt-1 text-xs text-muted-foreground">Password baru minimal 8 karakter.</p>
              <div className="mt-3 flex gap-2">
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field" placeholder="Password baru" />
                <button onClick={resetPassword} className="rounded-md hairline px-3 text-sm hover:bg-secondary">Reset</button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <th className={`px-6 py-3 font-medium ${align === "right" ? "text-right" : "text-left"}`}>{children}</th>;
}

function Td({ children, className = "", align = "left" }: { children: React.ReactNode; className?: string; align?: "left" | "right" }) {
  return <td className={`px-6 py-3 ${align === "right" ? "text-right" : "text-left"} ${className}`}>{children}</td>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function initial(name: string, email: string) {
  return (name || email || "U").slice(0, 1).toUpperCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
