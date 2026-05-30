import t1 from "@/assets/tpl-1.jpg";
import t4 from "@/assets/tpl-4.jpg";
import t5 from "@/assets/tpl-5.jpg";

const demos = [
  { src: t1, name: "Aurelia · Wedding", url: "undanganku.id/aurelia-demo" },
  { src: t4, name: "Bloom · Floral", url: "undanganku.id/bloom-demo" },
  { src: t5, name: "Gatsby · Art Deco", url: "undanganku.id/gatsby-demo" },
];

export function Demo() {
  return (
    <section id="demo" className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm text-gold tracking-widest uppercase mb-3">Demo Populer</p>
          <h2 className="font-serif text-4xl md:text-5xl">Lihat seperti apa undangan kamu nanti</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {demos.map((d) => (
            <a key={d.name} href="#preview" className="group">
              <div className="relative mx-auto" style={{ maxWidth: 280 }}>
                <div className="relative rounded-[2.5rem] p-2 bg-secondary hairline shadow-elegant">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-background rounded-full z-10" />
                  <div className="rounded-[2rem] overflow-hidden aspect-[9/19] bg-background">
                    <img src={d.src} alt={d.name} loading="lazy" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                </div>
              </div>
              <div className="text-center mt-5">
                <p className="font-serif text-lg">{d.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.url}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
