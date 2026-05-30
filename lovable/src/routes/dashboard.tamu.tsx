import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { guestList } from "@/lib/mock";
import { Upload, Plus, Send } from "lucide-react";

export const Route = createFileRoute("/dashboard/tamu")({
  component: TamuPage,
});

function TamuPage() {
  return (
    <>
      <Topbar title="Tamu Undangan" subtitle={`${guestList.length} tamu terdaftar`}>
        <button className="inline-flex items-center gap-2 rounded-full hairline px-4 py-2 text-sm hover:bg-secondary"><Upload className="size-4" />Import CSV</button>
        <button className="inline-flex items-center gap-2 rounded-full bg-gold-gradient text-primary-foreground px-4 py-2 text-sm shadow-gold"><Plus className="size-4" />Tambah Tamu</button>
      </Topbar>
      <div className="p-6">
        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3"><input type="checkbox" /></th>
                  <th className="text-left px-6 py-3">Nama</th>
                  <th className="text-left px-6 py-3">No. HP</th>
                  <th className="text-left px-6 py-3">Undangan</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Dibuka</th>
                  <th className="text-right px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {guestList.map((g) => (
                  <tr key={g.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-3"><input type="checkbox" /></td>
                    <td className="px-6 py-3 font-medium">{g.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{g.phone}</td>
                    <td className="px-6 py-3 text-muted-foreground">{g.invitation}</td>
                    <td className="px-6 py-3"><StatusPill status={g.status} /></td>
                    <td className="px-6 py-3"><span className={g.opened ? "text-emerald-400" : "text-muted-foreground"}>{g.opened ? "Ya" : "-"}</span></td>
                    <td className="px-6 py-3 text-right">
                      <button className="inline-flex items-center gap-1 rounded-md hairline px-2.5 py-1 text-xs hover:bg-secondary"><Send className="size-3" />Kirim WA</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

