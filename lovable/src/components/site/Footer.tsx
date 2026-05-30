export function Footer() {
  return (
    <footer className="border-t border-border/50 py-14">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-serif text-2xl text-gold-gradient">Undanganku</div>
          <p className="text-sm text-muted-foreground mt-3 max-w-sm">
            Platform undangan digital premium untuk wedding, ulang tahun, dan acara spesial lainnya.
          </p>
          <a
            href="https://wa.me/6281234567890"
            className="inline-flex items-center gap-2 mt-5 rounded-full hairline px-4 py-2 text-sm hover:bg-secondary transition"
          >
            <span className="size-2 rounded-full bg-emerald-400" /> WhatsApp 0812-3456-7890
          </a>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Produk</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#template" className="hover:text-foreground">Template</a></li>
            <li><a href="#harga" className="hover:text-foreground">Harga</a></li>
            <li><a href="#demo" className="hover:text-foreground">Demo</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Perusahaan</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#about" className="hover:text-foreground">Tentang</a></li>
            <li><a href="#blog" className="hover:text-foreground">Blog</a></li>
            <li><a href="#syarat" className="hover:text-foreground">Syarat & Kebijakan</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 mt-10 pt-6 border-t border-border/50 text-xs text-muted-foreground flex justify-between flex-wrap gap-2">
        <span>© 2026 Undanganku. All rights reserved.</span>
        <span>Made with ✦ in Indonesia</span>
      </div>
    </footer>
  );
}
