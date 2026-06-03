import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, CalendarDays, Gift, MapPin, Pause, Play, Send, Share2, Users, Volume2, VolumeX } from "lucide-react";
import { formatInvitationDate, getTemplateBySlug, type Invitation, userInvitations } from "@/lib/invitations";
import { getInvitation, submitRSVP, trackEvent, type ApiInvitation, type RSVPInput } from "@/lib/api";

export const Route = createFileRoute("/u/$slug")({
  head: () => ({
    meta: [
      { title: "Undangan Digital - Undanganku" },
      { name: "description", content: "Undangan digital dengan RSVP, galeri, lokasi, musik, gift, dan personalisasi tamu." },
      { property: "og:title", content: "Undangan Digital - Undanganku" },
      { property: "og:description", content: "Buka undangan digital premium dari Undanganku." },
    ],
  }),
  component: InvitationPreview,
});

function InvitationPreview() {
  const { slug } = Route.useParams();
  const fallbackInvitation = useMemo(() => userInvitations.find((item) => item.slug === slug) ?? userInvitations[0], [slug]);
  const [apiInvitation, setApiInvitation] = useState<Invitation | null>(null);
  const invitation = apiInvitation ?? fallbackInvitation;
  const template = getTemplateBySlug(invitation.templateSlug);
  const invitationMedia = invitation as Invitation & { galleryImages?: string[]; gift?: { bank?: string; account?: string }; musicTrack?: string; watermark?: boolean };
  const galleryImages = invitationMedia.galleryImages?.length ? invitationMedia.galleryImages : [invitation.img, template.img, invitation.img];
  const musicLabel = musicTrackLabel(invitationMedia.musicTrack);
  const musicSrc = musicTrackSource(invitationMedia.musicTrack);
  const guestName = useMemo(() => {
    if (typeof window === "undefined") return "Tamu Undangan";
    return new URLSearchParams(window.location.search).get("to")?.replace(/\+/g, " ").trim() || "Tamu Undangan";
  }, []);
  const gift = invitationMedia.gift ?? { bank: "BCA", account: "1234567890" };
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [opened, setOpened] = useState(false);
  const [music, setMusic] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [rsvp, setRsvp] = useState<{
    name: string;
    message: string;
    status: RSVPInput["status"];
    guests: string;
  }>({
    name: "",
    message: "",
    status: "attending",
    guests: "1",
  });

  useEffect(() => {
    let cancelled = false;
    getInvitation(slug)
      .then((item) => {
        if (!cancelled) {
          setApiInvitation(fromApiInvitation(item, fallbackInvitation));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiInvitation(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, fallbackInvitation]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = `${invitation.bride} & ${invitation.groom} untuk ${guestName} - Undanganku`;
  }, [guestName, invitation.bride, invitation.groom]);

  useEffect(() => {
    void trackEvent({
      eventName: "page_view",
      invitationSlug: slug,
      properties: { guest: guestName, templateSlug: invitation.templateSlug },
    }).catch(() => undefined);
  }, [guestName, invitation.templateSlug, slug]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicSrc) return;
    if (opened && music) {
      void audio.play().catch(() => setMusic(false));
      return;
    }
    audio.pause();
  }, [music, musicSrc, opened]);

  useEffect(() => {
    if (!opened || !readMode || typeof window === "undefined") return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-read-section]"));
    let index = Math.max(0, sections.findIndex((section) => section.getBoundingClientRect().top > 24));
    let timer: number | undefined;

    const scrollNext = () => {
      if (!sections.length || index >= sections.length) {
        setReadMode(false);
        return;
      }
      sections[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
      index += 1;
      timer = window.setTimeout(scrollNext, 5200);
    };

    timer = window.setTimeout(scrollNext, 1400);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [opened, readMode]);

  const handleOpen = () => {
    setOpened(true);
    setReadMode(true);
    if (musicSrc) setMusic(true);
  };

  const shareInvitation = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    const title = `Undangan ${invitation.bride} & ${invitation.groom}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard?.writeText(url);
      }
      void trackEvent({ eventName: "share_click", invitationSlug: slug, properties: { guest: guestName } }).catch(() => undefined);
    } catch {
      // User cancelled native share sheet.
    }
  };

  return (
    <main className="min-h-screen bg-[#18120f] text-[#fff8ed]">
      {!opened && (
        <section className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[#18120f]">
          <img src={invitation.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />
          <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-end px-8 pb-14 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[#e8c77c]">The Wedding of</p>
            <h1 className="mt-4 font-serif text-6xl leading-[0.88] text-[#f4d58a]">{invitation.bride}<br />&<br />{invitation.groom}</h1>
            <p className="mt-5 text-sm text-[#fff8ed]/75">Kepada Bapak/Ibu/Saudara/i</p>
            <p className="mt-1 font-serif text-2xl">{guestName}</p>
            <button
              onClick={handleOpen}
              className="mt-8 rounded-full bg-[#e8c77c] px-7 py-3 text-sm font-semibold text-[#24170f] shadow-[0_20px_60px_rgba(232,199,124,0.28)]"
            >
              Buka Undangan
            </button>
          </div>
        </section>
      )}

      <div className={readMode ? "scroll-smooth" : ""}>
        <section data-read-section className="relative grid min-h-dvh place-items-center overflow-hidden px-6 py-16 text-center">
          <img src={invitation.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,199,124,0.24),transparent_45%),linear-gradient(to_bottom,rgba(24,18,15,0.25),rgba(24,18,15,0.95))]" />
          <div className="relative mx-auto max-w-md">
            <p className="text-xs uppercase tracking-[0.35em] text-[#e8c77c]">Undangan Pernikahan</p>
            <h2 className="mt-5 font-serif text-6xl leading-[0.9] text-[#f4d58a]">{invitation.bride}<br />&<br />{invitation.groom}</h2>
            <p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-[#fff8ed]/75">
              Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam hari bahagia kami.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#e8c77c]/35 bg-black/20 px-5 py-2 text-sm text-[#fff8ed]/85">
              <CalendarDays className="size-4 text-[#e8c77c]" />
              {formatInvitationDate(invitation.date)}
            </div>
          </div>
        </section>

        <section data-read-section className="mx-auto max-w-4xl px-6 py-16">
          <div className="grid gap-4 md:grid-cols-2">
            <EventCard title="Akad Nikah" time={invitation.akadTime} date={formatInvitationDate(invitation.date)} venue={invitation.venue} />
            <EventCard title="Resepsi" time={invitation.receptionTime} date={formatInvitationDate(invitation.date)} venue={invitation.venue} />
          </div>
          <div className="mt-5 rounded-lg border border-[#e8c77c]/25 bg-white/[0.06] p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-[#e8c77c]" />
              <div>
                <h3 className="font-serif text-2xl">Lokasi Acara</h3>
                <p className="mt-1 text-sm text-[#fff8ed]/75">{invitation.venue}, {invitation.city}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.venue)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-[#e8c77c] px-5 py-2 text-sm font-semibold text-[#24170f]">Lihat Lokasi</a>
              </div>
            </div>
          </div>
        </section>

        <section data-read-section className="bg-[#fff8ed] px-6 py-16 text-[#24170f]">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#9a6a2f]">Template</p>
            <h2 className="mt-3 font-serif text-4xl">{template.name}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {galleryImages.map((img, index) => (
                <div key={index} className="aspect-[3/4] overflow-hidden rounded-lg bg-[#e7dcc8]">
                  <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section data-read-section className="mx-auto grid max-w-4xl gap-5 px-6 py-16 md:grid-cols-2">
          <div className="rounded-lg border border-[#e8c77c]/25 bg-white/[0.06] p-5">
            <Users className="size-6 text-[#e8c77c]" />
            <h2 className="mt-4 font-serif text-3xl">Konfirmasi Kehadiran</h2>
            <p className="mt-2 text-sm text-[#fff8ed]/70">Isi RSVP agar tuan rumah bisa menyiapkan acara dengan lebih rapi.</p>
            <div className="mt-5 space-y-3">
              <input value={rsvp.name} onChange={(event) => setRsvp((value) => ({ ...value, name: event.target.value }))} placeholder="Nama tamu" className="w-full rounded-md border border-[#e8c77c]/25 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-[#fff8ed]/35" />
              <textarea value={rsvp.message} onChange={(event) => setRsvp((value) => ({ ...value, message: event.target.value }))} placeholder="Ucapan singkat" className="min-h-20 w-full rounded-md border border-[#e8c77c]/25 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-[#fff8ed]/35" />
              <div className="grid grid-cols-2 gap-3">
                <select value={rsvp.status} onChange={(event) => setRsvp((value) => ({ ...value, status: event.target.value as typeof rsvp.status }))} className="rounded-md border border-[#e8c77c]/25 bg-[#18120f] px-3 py-2 text-sm outline-none">
                  <option value="attending">Hadir</option>
                  <option value="pending">Masih tentative</option>
                  <option value="declined">Tidak hadir</option>
                </select>
                <input type="number" min="1" max="10" value={rsvp.guests} onChange={(event) => setRsvp((value) => ({ ...value, guests: event.target.value }))} className="rounded-md border border-[#e8c77c]/25 bg-black/20 px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <button
              onClick={async () => {
                setRsvpError("");
                if (!rsvp.name.trim()) {
                  setRsvpError("Nama tamu wajib diisi.");
                  return;
                }
                try {
                  await submitRSVP(invitation.slug, {
                    name: rsvp.name,
                    message: rsvp.message,
                    status: rsvp.status,
                    guests: Number(rsvp.guests) || 1,
                  });
                  void trackEvent({
                    eventName: "rsvp_submit",
                    invitationSlug: invitation.slug,
                    properties: { status: rsvp.status, guests: Number(rsvp.guests) || 1 },
                  }).catch(() => undefined);
                  setRsvpSent(true);
                } catch (error) {
                  setRsvpError(error instanceof Error ? error.message : "Gagal mengirim RSVP");
                }
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#e8c77c] px-5 py-2 text-sm font-semibold text-[#24170f]"
            >
              <Send className="size-4" /> Kirim RSVP
            </button>
            {rsvpSent && <p className="mt-3 text-sm text-emerald-200">Terima kasih, konfirmasi demo tersimpan.</p>}
            {rsvpError && <p className="mt-3 text-sm text-red-200">{rsvpError}</p>}
          </div>
          <div className="rounded-lg border border-[#e8c77c]/25 bg-white/[0.06] p-5">
            <Gift className="size-6 text-[#e8c77c]" />
            <h2 className="mt-4 font-serif text-3xl">Kado Pernikahan</h2>
            <p className="mt-2 text-sm text-[#fff8ed]/70">Doa restu adalah hadiah terbaik. Fitur gift bisa diaktifkan dari builder.</p>
            <div className="mt-5 rounded-md bg-black/20 p-4 text-sm">
              <p className="text-[#fff8ed]/55">{gift.bank || "Bank"}</p>
              <p className="font-medium">{gift.account || "-"} a.n. {invitation.bride}</p>
            </div>
          </div>
        </section>

        <footer className="px-6 pb-24 pt-4 text-center text-sm text-[#fff8ed]/55">
          <p>Terima kasih atas doa dan kehadirannya.</p>
        </footer>
      </div>

      <audio ref={audioRef} src={musicSrc} preload="none" loop />

      {invitationMedia.watermark && (
        <a
          href="/"
          className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full border border-[#e8c77c]/25 bg-[#18120f]/85 px-4 py-2 text-[11px] text-[#fff8ed]/70 shadow-2xl backdrop-blur"
        >
          Dibuat dengan Undanganku
        </a>
      )}

      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#e8c77c]/30 bg-[#18120f]/85 p-2 shadow-2xl backdrop-blur">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="grid size-10 place-items-center rounded-full bg-white/10 text-[#e8c77c]" aria-label="Kembali ke atas">
          <ArrowUp className="size-4" />
        </button>
        <button onClick={() => setMusic((value) => !value)} disabled={!musicSrc} className="grid size-10 place-items-center rounded-full bg-white/10 text-[#e8c77c] disabled:opacity-45" aria-label="Toggle musik">
          {music ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
        <span className="max-w-28 truncate px-2 text-xs text-[#fff8ed]/70">{musicLabel}</span>
        <button onClick={() => setReadMode((value) => !value)} className="grid size-10 place-items-center rounded-full bg-[#e8c77c] text-[#24170f]" aria-label="Toggle auto read">
          {readMode ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <button onClick={shareInvitation} className="grid size-10 place-items-center rounded-full bg-white/10 text-[#e8c77c]" aria-label="Bagikan undangan">
          <Share2 className="size-4" />
        </button>
      </div>
    </main>
  );
}

function EventCard({ title, time, date, venue }: { title: string; time: string; date: string; venue: string }) {
  return (
    <article className="rounded-lg border border-[#e8c77c]/25 bg-white/[0.06] p-5">
      <h3 className="font-serif text-3xl text-[#f4d58a]">{title}</h3>
      <p className="mt-3 text-sm text-[#fff8ed]/70">{date}</p>
      <p className="mt-1 text-2xl font-semibold">{time}</p>
      <p className="mt-3 text-sm leading-6 text-[#fff8ed]/70">{venue}</p>
    </article>
  );
}

function fromApiInvitation(item: ApiInvitation, fallback: Invitation): Invitation {
  const config = item.config ?? {};
  return {
    ...fallback,
    id: item.id,
    title: item.title || item.couple,
    slug: item.slug,
    template: item.template,
    templateSlug: item.templateSlug,
    status: item.status === "published" ? "Published" : "Draft",
    rsvp: item.rsvpCount,
    date: item.eventDate,
    groom: String(config.groom ?? fallback.groom),
    bride: String(config.bride ?? fallback.bride),
    venue: String(config.venue ?? fallback.venue),
    city: String(config.city ?? fallback.city),
    akadTime: String(config.akadTime ?? fallback.akadTime),
    receptionTime: String(config.receptionTime ?? fallback.receptionTime),
    img: Array.isArray(config.galleryImages) && config.galleryImages[0] ? String(config.galleryImages[0]) : getTemplateBySlug(item.templateSlug).img,
    galleryImages: Array.isArray(config.galleryImages) ? config.galleryImages.map(String) : [],
    gift: typeof config.gift === "object" && config.gift !== null ? config.gift : undefined,
    musicTrack: String(config.musicTrack ?? "gamelan-jawa"),
    watermark: item.watermark,
  } as Invitation & { galleryImages: string[]; gift?: { bank?: string; account?: string }; musicTrack: string; watermark: boolean };
}

function musicTrackLabel(value?: string) {
  switch (value) {
    case "acoustic-romantic":
      return "Akustik Romantis";
    case "piano-wedding":
      return "Piano Wedding";
    case "none":
      return "Tanpa Musik";
    default:
      return "Gamelan Jawa Lembut";
  }
}

function musicTrackSource(value?: string) {
  if (value === "none") return "";
  if (value === "acoustic-romantic" || value === "piano-wedding") {
    return "/templates/adat-jawa-050-klasik-alyssa-rayhan/assets/audio/gending.mp3";
  }
  return "/templates/adat-jawa-050-klasik-alyssa-rayhan/assets/audio/gending.mp3";
}
