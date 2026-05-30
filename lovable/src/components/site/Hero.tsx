import heroPhone from "@/assets/hero-phone.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: "var(--gradient-hero)" }} />
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full hairline px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-gold" />
            Premium digital invitation since 2024
          </div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Buat Undangan <em className="text-gold-gradient not-italic">Online Premium</em><br />
            dalam Hitungan Menit.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Pilih template, isi detail acara, dan publish. Bagikan link cantik ke tamu — lengkap
            dengan RSVP, ucapan, gift, dan galeri foto.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#buat" className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90 transition">
              Buat Undangan Sekarang
            </a>
            <a href="#template" className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium hairline hover:bg-secondary transition">
              Lihat Template
            </a>
          </div>
          <div className="flex items-center gap-8 pt-4 text-sm text-muted-foreground">
            <div><span className="text-foreground font-semibold text-xl font-serif">12k+</span><br />Undangan dibuat</div>
            <div className="h-8 w-px bg-border" />
            <div><span className="text-foreground font-semibold text-xl font-serif">4.9</span><br />Rating pengguna</div>
            <div className="h-8 w-px bg-border" />
            <div><span className="text-foreground font-semibold text-xl font-serif">120+</span><br />Template</div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-10 bg-gold/10 blur-3xl rounded-full" />
          <div className="relative rounded-3xl overflow-hidden hairline shadow-elegant">
            <img
              src={heroPhone}
              alt="Pratinjau undangan digital premium di layar smartphone"
              width={1280}
              height={1280}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
