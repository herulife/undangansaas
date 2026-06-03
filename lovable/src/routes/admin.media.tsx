import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Topbar } from "@/components/dashboard/Shared";
import { Upload, Folder, Image as ImgIcon, Music } from "lucide-react";
import { listAdminMedia, uploadMedia, type MediaAsset } from "@/lib/api";

export const Route = createFileRoute("/admin/media")({
  component: MediaPage,
});

function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [message, setMessage] = useState("Memuat media...");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    try {
      const data = await listAdminMedia();
      setAssets(data);
      setMessage(`${data.length} asset tersimpan`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat media");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const folders = useMemo(() => {
    const images = assets.filter((asset) => asset.mediaType === "images").length;
    const audio = assets.filter((asset) => asset.mediaType === "audio").length;
    return [
      { name: "Template Assets", count: assets.filter((asset) => asset.provider === "template").length, icon: ImgIcon },
      { name: "User Uploads", count: assets.length, icon: Folder },
      { name: "Music Library", count: audio, icon: Music },
      { name: "Images", count: images, icon: ImgIcon },
    ];
  }, [assets]);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setMessage("Mengunggah asset...");
    try {
      await uploadMedia(file);
      await load();
      setMessage("Asset berhasil diunggah.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal upload asset");
    }
  };

  return (
    <>
      <Topbar title="Media Manager" subtitle={message}>
        <input ref={inputRef} type="file" accept="image/*,audio/*" className="sr-only" onChange={(event) => handleUpload(event.target.files?.[0])} />
        <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md bg-gold-gradient text-primary-foreground px-3 py-2 text-sm shadow-gold"><Upload className="size-4" />Upload</button>
      </Topbar>
      <div className="p-6 space-y-6">
        <div className="grid sm:grid-cols-4 gap-4">
          {folders.map((folder) => {
            const Icon = folder.icon;
            return (
              <button key={folder.name} className="text-left rounded-2xl bg-card hairline p-5 hover:bg-secondary/40 transition">
                <Icon className="size-6 text-gold mb-3" />
                <p className="font-medium">{folder.name}</p>
                <p className="text-xs text-muted-foreground">{folder.count.toLocaleString("id-ID")} items</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-card hairline p-6">
          <h3 className="font-serif text-lg mb-4">Recent uploads</h3>
          {assets.length === 0 ? (
            <div className="rounded-lg bg-secondary/30 px-4 py-8 text-center text-sm text-muted-foreground">Belum ada asset upload.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {assets.map((asset) => (
                <div key={asset.id} className="overflow-hidden rounded-md hairline bg-secondary">
                  <div className="aspect-square">
                    {asset.mediaType === "audio" ? (
                      <div className="grid h-full place-items-center text-gold"><Music className="size-8" /></div>
                    ) : (
                      <img src={asset.url} alt={asset.fileName} loading="lazy" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="border-t border-border/50 p-2">
                    <p className="truncate text-xs font-medium">{asset.fileName}</p>
                    <p className="text-[10px] text-muted-foreground">{formatBytes(asset.sizeBytes)} - {asset.mediaType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`;
}
