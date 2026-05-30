import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar, StatCard, StatusPill } from "@/components/dashboard/Shared";
import { formatInvitationDate, getTemplateBySlug, userInvitations, type Invitation } from "@/lib/invitations";
import { Plus, Eye, Edit3, Link2, Users } from "lucide-react";
import { getStoredUser, listInvitations, type ApiInvitation } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const [items, setItems] = useState<Invitation[]>(userInvitations);
  const user = useMemo(() => getStoredUser(), []);
  const totalViews = items.reduce((s, x) => s + x.views, 0);
  const totalRsvp = items.reduce((s, x) => s + x.rsvp, 0);
  const published = items.filter((x) => x.status === "Published").length;

  useEffect(() => {
    listInvitations()
      .then((data) => {
        const mapped = data.map(toInvitationCard);
        if (mapped.length) setItems(mapped);
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Selamat datang kembali, ${user?.displayName || "User"}`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Undangan Aktif" value={String(published)} hint={`dari ${items.length} total`} accent="gold" />
          <StatCard label="Total Views" value={totalViews.toLocaleString()} hint="+12% minggu ini" accent="info" />
          <StatCard label="RSVP Masuk" value={String(totalRsvp)} hint="184 hadir - 89 tidak" accent="success" />
          <StatCard label="Paket Aktif" value="Pro" hint="Berakhir 12 Jun 2027" accent="warning" />
        </div>

        <div className="rounded-2xl bg-card hairline p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">Siap bikin undangan baru?</h2>
            <p className="text-sm text-muted-foreground mt-1">Pilih template, isi form, langsung publish.</p>
          </div>
          <Link to="/dashboard/buat" className="inline-flex items-center gap-2 rounded-full bg-gold-gradient text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-gold">
            <Plus className="size-4" /> Buat Undangan Baru
          </Link>
        </div>

        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-serif text-lg">Undangan Saya</h3>
            <Link to="/dashboard/undangan" className="text-xs text-gold hover:underline">Lihat semua -&gt;</Link>
          </div>
          <div className="divide-y divide-border/40">
            {items.slice(0, 4).map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 px-6 py-4">
                <img src={inv.img} alt={inv.title} className="size-14 rounded-lg object-cover hairline" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-medium truncate">{inv.title}</p>
                    <StatusPill status={inv.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Template {inv.template} - {formatInvitationDate(inv.date)}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <a href={`/u/${inv.slug}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><Eye className="inline size-3.5 mr-1" />{inv.views}</a>
                  <span className="text-muted-foreground"><Users className="inline size-3.5 mr-1" />{inv.rsvp}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Link to="/dashboard/buat" className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary" aria-label="Edit"><Edit3 className="size-4" /></Link>
                  <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/u/${inv.slug}`)} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary" aria-label="Salin link"><Link2 className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
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
