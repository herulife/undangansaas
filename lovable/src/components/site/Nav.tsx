import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl text-gold-gradient leading-none">Undanganku</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#template" className="hover:text-foreground transition">Template</a>
          <a href="#harga" className="hover:text-foreground transition">Harga</a>
          <a href="#demo" className="hover:text-foreground transition">Demo</a>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-xs text-muted-foreground hover:text-gold hidden sm:inline">Admin</Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">Dashboard</Link>
          <Link
            to="/dashboard/buat"
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90 transition"
          >
            Buat Undangan
          </Link>
        </div>
      </div>
    </header>
  );
}
