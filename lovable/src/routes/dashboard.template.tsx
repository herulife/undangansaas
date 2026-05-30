import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Shared";
import { invitationTemplates } from "@/lib/templates";

export const Route = createFileRoute("/dashboard/template")({
  component: TemplatePage,
});

function TemplatePage() {
  return (
    <>
      <Topbar title="Galeri Template" subtitle="Pilih template untuk undangan kamu" />
      <div className="p-6 space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["Semua", "Wedding", "Adat Jawa", "Adat Sunda", "Adat Minang"].map((c, i) => (
            <button key={c} className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${i === 0 ? "bg-gold-gradient text-primary-foreground" : "hairline text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {invitationTemplates.map((t) => (
            <article key={t.slug} className="group rounded-2xl bg-card hairline overflow-hidden">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <span className="absolute top-3 left-3 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 text-[11px] text-gold-soft hairline">{t.tier}</span>
              </div>
              <div className="p-4">
                <div className="min-h-14">
                  <h3 className="font-serif text-lg leading-none">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t.category}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a href={t.previewUrl} target="_blank" rel="noreferrer" className="text-center rounded-md hairline px-3 py-1.5 text-xs hover:bg-secondary">Preview</a>
                  <button className="rounded-md bg-gold-gradient text-primary-foreground px-3 py-1.5 text-xs">Pakai</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
