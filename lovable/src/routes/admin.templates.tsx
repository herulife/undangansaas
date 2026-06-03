import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { Plus, Upload } from "lucide-react";
import { listTemplates, registerAdminTemplate, type ApiTemplate } from "@/lib/api";
import { invitationTemplates } from "@/lib/templates";

export const Route = createFileRoute("/admin/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [message, setMessage] = useState("Memuat registry template...");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "Wedding",
    tierAccess: "free,creator,pro,business",
    assetsUrl: "",
    previewUrl: "",
  });

  const load = async () => {
    try {
      const data = await listTemplates();
      setTemplates(data);
      setMessage(`${data.length} template dari registry`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat template");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createTemplate = async () => {
    setMessage("Mendaftarkan template...");
    try {
      await registerAdminTemplate({
        name: form.name,
        slug: form.slug,
        category: form.category,
        assetsUrl: form.assetsUrl || `/templates/${form.slug}`,
        previewUrl: form.previewUrl || `/templates/${form.slug}/index.html`,
        tierAccess: form.tierAccess.split(",").map((item) => item.trim()).filter(Boolean),
        isActive: true,
      });
      setForm((current) => ({ ...current, name: "", slug: "", assetsUrl: "", previewUrl: "" }));
      await load();
      setMessage("Template berhasil masuk registry.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal register template");
    }
  };

  return (
    <>
      <Topbar title="Kelola Template" subtitle={message}>
        <button className="inline-flex items-center gap-2 rounded-md hairline px-3 py-2 text-sm hover:bg-secondary"><Upload className="size-4" />Upload Asset</button>
        <button onClick={createTemplate} className="inline-flex items-center gap-2 rounded-md bg-gold-gradient text-primary-foreground px-3 py-2 text-sm shadow-gold"><Plus className="size-4" />Template Baru</button>
      </Topbar>
      <div className="p-6 space-y-6">
        <div className="rounded-2xl bg-card hairline p-5">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} placeholder="Nama template" className="field" />
            <input value={form.slug} onChange={(event) => setForm((value) => ({ ...value, slug: slugify(event.target.value) }))} placeholder="slug-template" className="field" />
            <input value={form.category} onChange={(event) => setForm((value) => ({ ...value, category: event.target.value }))} placeholder="Kategori" className="field" />
            <input value={form.tierAccess} onChange={(event) => setForm((value) => ({ ...value, tierAccess: event.target.value }))} placeholder="free,creator,pro" className="field" />
            <input value={form.assetsUrl} onChange={(event) => setForm((value) => ({ ...value, assetsUrl: event.target.value }))} placeholder="/templates/slug" className="field" />
            <input value={form.previewUrl} onChange={(event) => setForm((value) => ({ ...value, previewUrl: event.target.value }))} placeholder="/templates/slug/index.html" className="field" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((template) => {
            const local = invitationTemplates.find((item) => item.slug === template.slug);
            return (
              <article key={template.id} className="rounded-2xl bg-card hairline overflow-hidden">
                <div className="aspect-[16/10] overflow-hidden bg-secondary">
                  {local?.img ? (
                    <img src={local.img} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-muted-foreground">{template.slug}</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-lg">{template.name}</h3>
                    <StatusPill status={template.isActive ? "Published" : "Draft"} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <Mini label="Kategori" value={template.category} />
                    <Mini label="Tier" value={template.tierAccess.join(", ")} />
                    <Mini label="Slug" value={template.slug} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 rounded-md hairline px-3 py-1.5 text-xs hover:bg-secondary">Edit Schema</button>
                    <a href={template.previewUrl} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-md bg-gold-gradient text-primary-foreground px-3 py-1.5 text-xs">Preview</a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/40 px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-medium truncate">{value}</p>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}
