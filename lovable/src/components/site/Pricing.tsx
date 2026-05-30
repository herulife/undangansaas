const tiers = [
  {
    name: "Free", price: "Rp0", period: "selamanya",
    desc: "Coba dulu, publish undangan sederhana.",
    features: ["1 undangan aktif", "5 template basic", "RSVP terbatas", "Watermark Undanganku"],
    cta: "Mulai Gratis",
  },
  {
    name: "Creator", price: "Rp99k", period: "/undangan",
    desc: "Cocok untuk acara personal.",
    features: ["1 undangan premium", "Semua template", "RSVP unlimited", "Galeri 30 foto", "Musik & love story"],
    cta: "Pilih Creator",
  },
  {
    name: "Pro", price: "Rp199k", period: "/undangan", featured: true,
    desc: "Paling populer untuk wedding.",
    features: ["Semua fitur Creator", "Custom domain", "Tanpa watermark", "Maps interaktif", "Gift digital QRIS", "Priority support"],
    cta: "Pilih Pro",
  },
  {
    name: "Business", price: "Rp499k", period: "/bulan",
    desc: "Untuk reseller & WO.",
    features: ["Undangan unlimited", "Sub-akun klien", "White-label brand", "Laporan & analytics", "API akses"],
    cta: "Hubungi Sales",
  },
];

export function Pricing() {
  return (
    <section id="harga" className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm text-gold tracking-widest uppercase mb-3">Harga</p>
          <h2 className="font-serif text-4xl md:text-5xl">Mulai gratis, upgrade saat siap publish</h2>
          <p className="text-muted-foreground mt-4">Tidak ada biaya tersembunyi. Bayar per undangan atau langganan.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                t.featured ? "bg-card shadow-gold hairline ring-1 ring-gold/40" : "bg-card hairline"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-gradient text-primary-foreground text-[11px] px-3 py-1 font-medium">
                  Paling Populer
                </span>
              )}
              <h3 className="font-serif text-2xl">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 min-h-[2.5rem]">{t.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-4xl">{t.price}</span>
                <span className="text-xs text-muted-foreground">{t.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-gold mt-0.5">✦</span>
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#daftar"
                className={`mt-6 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  t.featured
                    ? "bg-gold-gradient text-primary-foreground hover:opacity-90"
                    : "hairline hover:bg-secondary"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
