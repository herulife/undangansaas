import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { adminTemplates } from "@/lib/mock";
import { Plus, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <>
      <Topbar title="Kelola Template" subtitle="Upload, edit, dan publish template undangan">
        <button className="inline-flex items-center gap-2 rounded-md hairline px-3 py-2 text-sm hover:bg-secondary"><Upload className="size-4" />Upload Asset</button>
        <button className="inline-flex items-center gap-2 rounded-md bg-gold-gradient text-primary-foreground px-3 py-2 text-sm shadow-gold"><Plus className="size-4" />Template Baru</button>
      </Topbar>
      <div className="p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {adminTemplates.map((t) => (
            <article key={t.id} className="rounded-2xl bg-card hairline overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden bg-secondary">
                <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif text-lg">{t.name}</h3>
                  <StatusPill status={t.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <Mini label="Kategori" value={t.category} />
                  <Mini label="Tier" value={t.price} />
                  <Mini label="Pemakaian" value={t.uses.toString()} />
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 rounded-md hairline px-3 py-1.5 text-xs hover:bg-secondary">Edit Schema</button>
                  <a href={t.previewUrl} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-md bg-gold-gradient text-primary-foreground px-3 py-1.5 text-xs">Preview</a>
                </div>
              </div>
            </article>
          ))}
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
