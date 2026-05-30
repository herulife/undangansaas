import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { formatInvitationDate, getTemplateBySlug, userInvitations, type Invitation } from "@/lib/invitations";
import { Eye, Edit3, Link2, BarChart3, Plus } from "lucide-react";
import { listInvitations, type ApiInvitation } from "@/lib/api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/undangan")({
  component: UndanganList,
});

function UndanganList() {
  const [items, setItems] = useState<Invitation[]>(userInvitations);
  const [subtitle, setSubtitle] = useState(`${userInvitations.length} undangan demo`);

  useEffect(() => {
    listInvitations()
      .then((data) => {
        const mapped = data.map(toInvitationCard);
        setItems(mapped.length ? mapped : userInvitations);
        setSubtitle(`${mapped.length} undangan dari database`);
      })
      .catch((error) => setSubtitle(error instanceof Error ? error.message : "Gagal memuat database"));
  }, []);

  return (
    <>
      <Topbar title="Undangan Saya" subtitle={subtitle}>
        <Link to="/dashboard/buat" className="inline-flex items-center gap-2 rounded-full bg-gold-gradient text-primary-foreground px-4 py-2 text-sm shadow-gold">
          <Plus className="size-4" /> Buat Baru
        </Link>
      </Topbar>
      <div className="p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((inv) => (
            <article key={inv.id} className="rounded-2xl bg-card hairline overflow-hidden flex flex-col">
              <div className="aspect-[16/10] overflow-hidden bg-secondary">
                <img src={inv.img} alt={inv.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-xl">{inv.title}</h3>
                  <StatusPill status={inv.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Template {inv.template} - {formatInvitationDate(inv.date)}</p>
                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                  <div className="rounded-lg bg-secondary/40 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="font-serif text-lg">{inv.views}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/40 px-3 py-2">
                    <p className="text-xs text-muted-foreground">RSVP</p>
                    <p className="font-serif text-lg">{inv.rsvp}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs">
                  <Link to="/dashboard/buat" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md hairline px-3 py-2 hover:bg-secondary"><Edit3 className="size-3.5" />Edit</Link>
                  <a href={`/u/${inv.slug}`} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md hairline px-3 py-2 hover:bg-secondary"><Eye className="size-3.5" />Preview</a>
                  <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/u/${inv.slug}`)} className="size-9 rounded-md hairline hover:bg-secondary flex items-center justify-center" aria-label="Salin link"><Link2 className="size-3.5" /></button>
                  <Link to="/dashboard/rsvp" className="size-9 rounded-md hairline hover:bg-secondary flex items-center justify-center" aria-label="RSVP"><BarChart3 className="size-3.5" /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function toInvitationCard(item: ApiInvitation): Invitation {
  const template = getTemplateBySlug(item.templateSlug);
  const config = item.config ?? {};
  return {
    id: item.id,
    title: item.title || item.couple,
    slug: item.slug,
    template: item.template,
    templateSlug: item.templateSlug,
    date: item.eventDate,
    status: item.status === "published" ? "Published" : "Draft",
    views: 0,
    rsvp: item.rsvpCount,
    bride: String(config.bride ?? item.couple.split("&")[0]?.trim() ?? "Mempelai"),
    groom: String(config.groom ?? item.couple.split("&")[1]?.trim() ?? "Pasangan"),
    venue: String(config.venue ?? "Venue belum diisi"),
    city: String(config.city ?? ""),
    akadTime: String(config.akadTime ?? "08.00 WIB"),
    receptionTime: String(config.receptionTime ?? "11.00 WIB"),
    img: template.img,
  };
}
