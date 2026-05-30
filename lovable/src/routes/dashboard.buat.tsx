import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Shared";
import { invitationTemplates } from "@/lib/templates";
import { useMemo, useState } from "react";
import { CalendarDays, Copy, Eye, Gift, ImagePlus, Loader2, MapPin, Monitor, Music2, Save, Send, Smartphone, Users } from "lucide-react";
import { generateInvitationImage, saveInvitation, uploadMedia } from "@/lib/api";

export const Route = createFileRoute("/dashboard/buat")({
  component: BuatUndangan,
});

const sections = ["Template", "Mempelai", "Acara", "Lokasi", "Galeri", "Media", "RSVP", "Gift", "Publish"];
const musicOptions = [
  { value: "gamelan-jawa", label: "Gamelan Jawa Lembut" },
  { value: "acoustic-romantic", label: "Akustik Romantis" },
  { value: "piano-wedding", label: "Piano Wedding" },
  { value: "none", label: "Tanpa Musik" },
];

type BuilderData = {
  templateSlug: string;
  groom: string;
  bride: string;
  date: string;
  akadTime: string;
  receptionTime: string;
  venue: string;
  city: string;
  slug: string;
  giftBank: string;
  giftAccount: string;
  galleryImages: string[];
  musicTrack: string;
};

function BuatUndangan() {
  const [active, setActive] = useState("Template");
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [data, setData] = useState<BuilderData>({
    templateSlug: invitationTemplates[0].slug,
    groom: "Dimas Putra",
    bride: "Rara Wijaya",
    date: "2026-08-12",
    akadTime: "08.00 WIB",
    receptionTime: "11.00 WIB",
    venue: "Hotel Mulia, Jakarta",
    city: "Jakarta",
    slug: "rara-dimas",
    giftBank: "BCA",
    giftAccount: "1234567890",
    galleryImages: [],
    musicTrack: musicOptions[0].value,
  });

  const selectedTemplate = useMemo(
    () => invitationTemplates.find((template) => template.slug === data.templateSlug) ?? invitationTemplates[0],
    [data.templateSlug],
  );
  const previewUrl = `/u/${data.slug}`;

  const galleryPreview = data.galleryImages[0] || selectedTemplate.img;
  const update = (key: keyof BuilderData, value: string | string[]) => {
    setSaved(false);
    setSaveMessage("");
    setData((current) => ({ ...current, [key]: value }));
  };

  const addGalleryImage = (url: string) => {
    setSaved(false);
    setSaveMessage("");
    setData((current) => ({ ...current, galleryImages: [...current.galleryImages, url].slice(0, 6) }));
  };

  const handleGalleryUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadMessage("Mengunggah gambar...");
    try {
      const uploaded = await uploadMedia(file);
      addGalleryImage(uploaded.url);
      setUploadMessage("Gambar berhasil diunggah.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Gagal upload gambar.");
    }
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    setUploadMessage("Generate gambar sesuai template...");
    try {
      const generated = await generateInvitationImage({
        prompt: `Foto prewedding elegan untuk undangan ${selectedTemplate.category} ${selectedTemplate.name}, pasangan pengantin Indonesia, nuansa premium, tanpa teks, tanpa watermark`,
        style: "editorial wedding photography, warm gold tone, refined traditional details",
        size: "1024x1024",
      });
      addGalleryImage(generated.url);
      setUploadMessage("Gambar AI berhasil dibuat.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Gagal generate gambar AI.");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSave = async () => {
    await persistInvitation("draft");
  };

  const handlePublish = async () => {
    await persistInvitation("published");
  };

  const persistInvitation = async (status: "draft" | "published") => {
    const title = `${data.bride} & ${data.groom}`;
    try {
      await saveInvitation({
        slug: data.slug,
        title,
        couple: title,
        templateSlug: data.templateSlug,
        eventDate: data.date,
        status,
        config: {
          bride: data.bride,
          groom: data.groom,
          venue: data.venue,
          city: data.city,
          akadTime: data.akadTime,
          receptionTime: data.receptionTime,
          galleryImages: data.galleryImages,
          musicTrack: data.musicTrack,
          gift: {
            bank: data.giftBank,
            account: data.giftAccount,
          },
        },
      });
      setSaved(true);
      setSaveMessage(status === "published" ? "Undangan dipublish dan siap dibagikan." : "Draft tersimpan ke database.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Gagal menyimpan undangan.");
    }
  };

  return (
    <>
      <Topbar title="Wizard Buat Undangan" subtitle={saveMessage || (saved ? "Tersimpan sebagai draft" : "Lengkapi detail, lalu preview sebelum publish")}>
        <button onClick={handleSave} className="hidden md:inline-flex items-center gap-2 rounded-full hairline px-4 py-2 text-sm hover:bg-secondary"><Save className="size-4" />Simpan</button>
        <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full hairline px-4 py-2 text-sm hover:bg-secondary"><Eye className="size-4" />Preview</a>
        <button onClick={handlePublish} className="inline-flex items-center gap-2 rounded-full bg-gold-gradient text-primary-foreground px-4 py-2 text-sm shadow-gold"><Send className="size-4" />Publish</button>
      </Topbar>

      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-12">
        <aside className="col-span-12 border-r border-border/60 bg-surface/30 p-3 md:col-span-2">
          <div className="grid grid-cols-2 gap-1 md:block md:space-y-1">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  active === s ? "bg-gold/15 text-gold" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </aside>

        <section className="col-span-12 border-r border-border/60 p-6 md:col-span-5">
          <h2 className="mb-1 font-serif text-2xl">{active}</h2>
          <p className="mb-6 text-sm text-muted-foreground">{copyFor(active)}</p>
          <EditorSection
            active={active}
            data={data}
            selectedTemplate={selectedTemplate}
            update={update}
            uploadMessage={uploadMessage}
            generatingImage={generatingImage}
            handleGalleryUpload={handleGalleryUpload}
            handleGenerateImage={handleGenerateImage}
          />
        </section>

        <section className="col-span-12 bg-surface/20 p-6 md:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Live Preview</p>
            <div className="inline-flex rounded-full hairline p-1">
              <button onClick={() => setDevice("mobile")} aria-label="Mobile" className={`flex size-8 items-center justify-center rounded-full ${device === "mobile" ? "bg-gold-gradient text-primary-foreground" : "text-muted-foreground"}`}><Smartphone className="size-4" /></button>
              <button onClick={() => setDevice("desktop")} aria-label="Desktop" className={`flex size-8 items-center justify-center rounded-full ${device === "desktop" ? "bg-gold-gradient text-primary-foreground" : "text-muted-foreground"}`}><Monitor className="size-4" /></button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className={`relative rounded-[2rem] bg-secondary p-2 hairline shadow-elegant transition-all ${device === "mobile" ? "w-[300px]" : "w-full max-w-lg"}`}>
              <div className="overflow-hidden rounded-[1.5rem] bg-background">
                <div className="relative aspect-[9/16]">
                  <img src={galleryPreview} alt="Preview template" className="h-full w-full object-cover opacity-70" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-background/25 via-background/35 to-background/85 px-6 text-center">
                    <p className="mb-2 text-xs tracking-widest text-gold">The Wedding of</p>
                    <p className="font-serif text-4xl leading-none text-gold-gradient">{data.bride}<br /><span className="text-foreground text-xl">&</span><br />{data.groom}</p>
                    <p className="mt-4 text-xs text-muted-foreground">{new Date(data.date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{data.venue}</p>
                    <a href={previewUrl} target="_blank" rel="noreferrer" className="mt-6 rounded-full bg-gold-gradient px-5 py-2 text-xs font-medium text-primary-foreground">Buka Preview</a>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-px bg-border/40 text-center text-[10px] text-muted-foreground">
                  <Mini icon={<CalendarDays className="size-3" />} label={data.akadTime} />
                  <Mini icon={<MapPin className="size-3" />} label={data.city} />
                  <Mini icon={<Music2 className="size-3" />} label={musicOptions.find((item) => item.value === data.musicTrack)?.label ?? "Music"} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function EditorSection({
  active,
  data,
  selectedTemplate,
  update,
  uploadMessage,
  generatingImage,
  handleGalleryUpload,
  handleGenerateImage,
}: {
  active: string;
  data: BuilderData;
  selectedTemplate: (typeof invitationTemplates)[number];
  update: (key: keyof BuilderData, value: string | string[]) => void;
  uploadMessage: string;
  generatingImage: boolean;
  handleGalleryUpload: (file: File | undefined) => void;
  handleGenerateImage: () => void;
}) {
  if (active === "Template") {
    return (
      <div className="grid max-w-2xl grid-cols-2 gap-3">
        {invitationTemplates.map((template) => (
          <button
            key={template.slug}
            onClick={() => update("templateSlug", template.slug)}
            className={`overflow-hidden rounded-lg text-left transition ${selectedTemplate.slug === template.slug ? "hairline ring-1 ring-gold" : "border border-border/60 hover:border-gold/60"}`}
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img src={template.img} alt={template.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-3">
              <p className="font-serif text-lg leading-none">{template.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{template.category} - {template.tier}</p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (active === "Mempelai") {
    return (
      <div className="max-w-md space-y-5">
        <Field label="Nama Mempelai Wanita"><input value={data.bride} onChange={(e) => update("bride", e.target.value)} className="field" /></Field>
        <Field label="Nama Mempelai Pria"><input value={data.groom} onChange={(e) => update("groom", e.target.value)} className="field" /></Field>
        <Field label="Slug Undangan"><input value={data.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className="field" /></Field>
      </div>
    );
  }

  if (active === "Acara") {
    return (
      <div className="max-w-md space-y-5">
        <Field label="Tanggal Acara"><input type="date" value={data.date} onChange={(e) => update("date", e.target.value)} className="field" /></Field>
        <Field label="Jam Akad"><input value={data.akadTime} onChange={(e) => update("akadTime", e.target.value)} className="field" /></Field>
        <Field label="Jam Resepsi"><input value={data.receptionTime} onChange={(e) => update("receptionTime", e.target.value)} className="field" /></Field>
      </div>
    );
  }

  if (active === "Lokasi") {
    return (
      <div className="max-w-md space-y-5">
        <Field label="Venue"><input value={data.venue} onChange={(e) => update("venue", e.target.value)} className="field" /></Field>
        <Field label="Kota"><input value={data.city} onChange={(e) => update("city", e.target.value)} className="field" /></Field>
        <button className="inline-flex items-center gap-2 rounded-md hairline px-4 py-2 text-sm hover:bg-secondary"><MapPin className="size-4" />Cek Peta</button>
      </div>
    );
  }

  if (active === "Gift") {
    return (
      <div className="max-w-md space-y-5">
        <Field label="Bank"><input value={data.giftBank} onChange={(e) => update("giftBank", e.target.value)} className="field" /></Field>
        <Field label="Nomor Rekening"><input value={data.giftAccount} onChange={(e) => update("giftAccount", e.target.value)} className="field" /></Field>
      </div>
    );
  }

  if (active === "Galeri") {
    return (
      <div className="max-w-md space-y-5">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gold/40 bg-card p-6 text-center hover:bg-secondary/40">
          <ImagePlus className="mb-3 size-8 text-gold" />
          <span className="text-sm font-medium">Upload gambar galeri</span>
          <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, atau WebP sampai 12MB</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleGalleryUpload(event.target.files?.[0])} />
        </label>
        <button
          onClick={handleGenerateImage}
          disabled={generatingImage}
          className="inline-flex items-center gap-2 rounded-md hairline px-4 py-2 text-sm hover:bg-secondary disabled:opacity-60"
        >
          {generatingImage ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          Generate gambar sesuai template
        </button>
        {uploadMessage && <p className="text-sm text-muted-foreground">{uploadMessage}</p>}
        <div className="grid grid-cols-3 gap-3">
          {(data.galleryImages.length ? data.galleryImages : [selectedTemplate.img]).map((url, index) => (
            <div key={`${url}-${index}`} className="aspect-square overflow-hidden rounded-lg bg-secondary hairline">
              <img src={url} alt={`Galeri ${index + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (active === "Media") {
    return (
      <div className="max-w-md space-y-5">
        <Field label="Musik Latar">
          <select value={data.musicTrack} onChange={(e) => update("musicTrack", e.target.value)} className="field">
            {musicOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
        <div className="rounded-lg bg-card p-5 hairline">
          <div className="flex items-center gap-3">
            <Music2 className="size-5 text-gold" />
            <div>
              <p className="font-medium">{musicOptions.find((item) => item.value === data.musicTrack)?.label}</p>
              <p className="text-sm text-muted-foreground">Pilihan musik tersimpan ke undangan. Pemutar audio fisik akan memakai file musik setelah library audio aktif.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (active === "Publish") {
    const url = `${window.location.origin}/u/${data.slug}`;
    return (
      <div className="max-w-md rounded-lg bg-card p-5 hairline">
        <p className="text-sm text-muted-foreground">Link undangan siap dibagikan setelah publish.</p>
        <div className="mt-4 flex items-center gap-2 rounded-md bg-secondary/40 px-3 py-2 text-sm">
          <span className="flex-1 truncate">{url}</span>
          <button onClick={() => navigator.clipboard?.writeText(url)} className="text-gold" aria-label="Salin link"><Copy className="size-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md rounded-lg bg-card p-5 hairline">
      <div className="flex items-center gap-3">
        {active === "RSVP" ? <Users className="size-5 text-gold" /> : <Gift className="size-5 text-gold" />}
        <div>
          <p className="font-medium">{active} aktif untuk template ini</p>
          <p className="text-sm text-muted-foreground">Detail lengkap akan mengikuti schema builder berikutnya.</p>
        </div>
      </div>
    </div>
  );
}

function copyFor(active: string) {
  const map: Record<string, string> = {
    Template: "Pilih desain dasar dari folder template yang sudah dimasukkan.",
    Mempelai: "Nama dan slug ini akan menjadi identitas utama undangan.",
    Acara: "Atur tanggal serta jam akad dan resepsi.",
    Lokasi: "Masukkan venue dan kota agar tombol peta siap dipakai.",
    Galeri: "Upload foto sendiri atau generate gambar yang mengikuti nuansa template.",
    Media: "Pilih musik latar untuk undangan.",
    RSVP: "RSVP lokal aktif di preview dan siap disambungkan ke backend.",
    Gift: "Isi rekening dengan tampilan yang tetap halus dan tidak terlalu menonjol.",
    Publish: "Periksa link publik sebelum dibagikan ke tamu.",
  };
  return map[active] ?? "Lengkapi bagian ini.";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Mini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1 bg-secondary/40 py-2">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}
