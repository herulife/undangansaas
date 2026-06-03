import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login, setAuthSession } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk - Undanganku" },
      { name: "description", content: "Masuk ke dashboard Undanganku untuk mengelola undangan, RSVP, template, dan billing." },
    ],
  }),
  component: LoginPage,
});

const demoAccounts = [
  { label: "Demo User", email: "demo@cintabuku.site", password: "UserDemo2026!" },
  { label: "Demo Admin", email: "admin@cintabuku.site", password: "AdminDemo2026!" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await login(email, password);
      setAuthSession(session);
      await navigate({ to: session.user.role === "admin" ? "/admin" : "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-card p-7 hairline shadow-elegant">
        <Link to="/" className="font-serif text-2xl text-gold-gradient">Undanganku</Link>
        <h1 className="mt-8 font-serif text-4xl">Masuk</h1>
        <p className="mt-2 text-sm text-muted-foreground">Kelola undangan, RSVP, dan publish dari dashboard.</p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" required />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" required />
          </label>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
                setError("");
              }}
              className="rounded-md hairline px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Isi {account.label}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-full bg-gold-gradient px-5 py-3 text-sm font-medium text-primary-foreground shadow-gold disabled:opacity-60">
          {loading ? "Memproses..." : "Masuk Dashboard"}
        </button>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Belum punya akun? <Link to="/register" className="text-gold hover:underline">Daftar</Link>
        </p>
      </form>
    </main>
  );
}
