const items = [
  { name: "Rara & Dimas", role: "Wedding · Jakarta", quote: "Bikin undangannya cuma 30 menit. Tamu kami kagum sama desainnya, terlihat sangat mewah." },
  { name: "Putri H.", role: "WO Bandung", quote: "Sebagai reseller, paket Business sangat membantu. Bisa kelola banyak klien dari satu dashboard." },
  { name: "Andika", role: "Ulang Tahun Anak", quote: "Form-nya gampang banget, live preview-nya bikin yakin sebelum publish." },
];

export function Testimonials() {
  return (
    <section className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((it) => (
            <figure key={it.name} className="rounded-2xl bg-card hairline p-7">
              <span className="font-serif text-5xl text-gold leading-none">"</span>
              <blockquote className="mt-2 text-base text-foreground/90 leading-relaxed">{it.quote}</blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-medium">{it.name}</div>
                <div className="text-muted-foreground">{it.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
