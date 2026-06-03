import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/dashboard/Shared";
import { useTierGate } from "@/hooks/use-tier-gate";
import { listTemplates, type ApiTemplate } from "@/lib/api";
import { invitationTemplates, type InvitationTemplate } from "@/lib/templates";

export const Route = createFileRoute("/dashboard/template")({
  component: TemplatePage,
});

type TemplateCard = {
  slug: string;
  name: string;
  category: string;
  tier: string;
  img?: string;
  previewUrl: string;
  isLocked: boolean;
};

function TemplatePage() {
  const tierGate = useTierGate();
  const [apiTemplates, setApiTemplates] = useState<ApiTemplate[]>([]);
  const [message, setMessage] = useState("Pilih template untuk undangan kamu");
  const [category, setCategory] = useState("Semua");

  useEffect(() => {
    listTemplates()
      .then((items) => {
        setApiTemplates(items);
        setMessage(`${items.length} template dari registry`);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Memakai template lokal"));
  }, []);

  const cards = useMemo(() => {
    const fromApi = apiTemplates.map((template) => toCard(template, tierGate.tier));
    const merged = new Map<string, TemplateCard>();
    invitationTemplates.forEach((template) => merged.set(template.slug, toLocalCard(template, tierGate.tier)));
    fromApi.forEach((template) => merged.set(template.slug, { ...merged.get(template.slug), ...template }));
    return Array.from(merged.values());
  }, [apiTemplates, tierGate.tier]);

  const categories = useMemo(() => ["Semua", ...Array.from(new Set(cards.map((item) => item.category)))], [cards]);
  const visibleCards = category === "Semua" ? cards : cards.filter((item) => item.category === category);

  return (
    <>
      <Topbar title="Galeri Template" subtitle={message} />
      <div className="p-6 space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${item === category ? "bg-gold-gradient text-primary-foreground" : "hairline text-muted-foreground hover:text-foreground"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibleCards.map((template) => (
            <article key={template.slug} className="group rounded-2xl bg-card hairline overflow-hidden">
              <div className="relative aspect-[3/4] overflow-hidden">
                {template.img ? (
                  <img src={template.img} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                ) : (
                  <div className="grid h-full place-items-center bg-secondary text-sm text-muted-foreground">{template.slug}</div>
                )}
                <span className="absolute top-3 left-3 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 text-[11px] text-gold-soft hairline">{template.tier}</span>
                {template.isLocked && <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">Upgrade</span>}
              </div>
              <div className="p-4">
                <div className="min-h-14">
                  <h3 className="font-serif text-lg leading-none">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{template.category}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a href={template.previewUrl} target="_blank" rel="noreferrer" className="text-center rounded-md hairline px-3 py-1.5 text-xs hover:bg-secondary">Preview</a>
                  <a
                    href={template.isLocked ? "/dashboard/billing" : `/dashboard/buat?template=${template.slug}`}
                    className="text-center rounded-md bg-gold-gradient text-primary-foreground px-3 py-1.5 text-xs"
                  >
                    {template.isLocked ? "Upgrade" : "Pakai"}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function toCard(template: ApiTemplate, tier: string): TemplateCard {
  const local = invitationTemplates.find((item) => item.slug === template.slug);
  return {
    slug: template.slug,
    name: template.name,
    category: template.category,
    tier: tierLabel(template.tierAccess),
    img: local?.img,
    previewUrl: template.previewUrl || local?.previewUrl || `/templates/${template.slug}/index.html`,
    isLocked: template.tierAccess.length > 0 && !template.tierAccess.includes(tier),
  };
}

function toLocalCard(template: InvitationTemplate, tier: string): TemplateCard {
  const access = template.tier === "Pro" ? ["pro", "business"] : template.tier === "Creator" ? ["creator", "pro", "business"] : ["free", "creator", "pro", "business"];
  return {
    slug: template.slug,
    name: template.name,
    category: template.category,
    tier: template.tier,
    img: template.img,
    previewUrl: template.previewUrl,
    isLocked: !access.includes(tier),
  };
}

function tierLabel(access: string[]) {
  if (access.includes("business") && !access.includes("pro")) return "Business";
  if (access.includes("pro") && !access.includes("creator")) return "Pro";
  if (access.includes("creator") && !access.includes("free")) return "Creator";
  return "Free";
}
