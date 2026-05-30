export function CtaBanner() {
  return (
    <section id="buat" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl hairline p-12 md:p-16 text-center bg-card">
          <div className="absolute inset-0 -z-10" style={{ backgroundImage: "var(--gradient-hero)" }} />
          <h2 className="font-serif text-4xl md:text-6xl max-w-3xl mx-auto leading-tight">
            Hari istimewa kamu layak diumumkan dengan <em className="text-gold-gradient not-italic">indah</em>.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-xl mx-auto">
            Buat undangan pertama gratis. Tidak perlu kartu kredit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a href="#daftar" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-medium bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90 transition">
              Buat Undangan Gratis
            </a>
            <a href="#template" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-medium hairline hover:bg-secondary transition">
              Lihat Semua Template
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
