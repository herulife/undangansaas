import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Shared";
import { templateImages } from "@/lib/mock";
import { Upload, Folder, Image as ImgIcon, Music } from "lucide-react";

export const Route = createFileRoute("/admin/media")({
  component: MediaPage,
});

const folders = [
  { name: "Template Assets", count: 184, icon: ImgIcon },
  { name: "User Uploads", count: 2410, icon: Folder },
  { name: "Music Library", count: 32, icon: Music },
];

function MediaPage() {
  const grid = [...templateImages, ...templateImages];
  return (
    <>
      <Topbar title="Media Manager" subtitle="Kelola asset gambar, audio, dan video">
        <button className="inline-flex items-center gap-2 rounded-md bg-gold-gradient text-primary-foreground px-3 py-2 text-sm shadow-gold"><Upload className="size-4" />Upload</button>
      </Topbar>
      <div className="p-6 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {folders.map((f) => {
            const Icon = f.icon;
            return (
              <button key={f.name} className="text-left rounded-2xl bg-card hairline p-5 hover:bg-secondary/40 transition">
                <Icon className="size-6 text-gold mb-3" />
                <p className="font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.count.toLocaleString()} items</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-lg mb-4">Recent uploads</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {grid.map((src, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden hairline bg-secondary">
                <img src={src} alt="asset" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
