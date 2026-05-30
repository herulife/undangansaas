import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatCard, StatusPill } from "@/components/dashboard/Shared";
import { rsvpList } from "@/lib/mock";
import { Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/rsvp")({
  component: RsvpPage,
});

function RsvpPage() {
  const attend = rsvpList.filter((r) => r.attend === "Hadir").length;
  const not = rsvpList.filter((r) => r.attend === "Tidak Hadir").length;
  const maybe = rsvpList.filter((r) => r.attend === "Ragu-ragu").length;
  return (
    <>
      <Topbar title="RSVP & Ucapan">
        <button className="inline-flex items-center gap-2 rounded-full hairline px-4 py-2 text-sm hover:bg-secondary"><Download className="size-4" />Export CSV</button>
      </Topbar>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total RSVP" value={String(rsvpList.length)} accent="gold" />
          <StatCard label="Hadir" value={String(attend)} accent="success" />
          <StatCard label="Tidak Hadir" value={String(not)} accent="danger" />
          <StatCard label="Ragu-ragu" value={String(maybe)} accent="warning" />
        </div>

        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-serif text-lg">Daftar Konfirmasi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><Th>Nama</Th><Th>Undangan</Th><Th>Status</Th><Th>Tamu</Th><Th>Ucapan</Th><Th>Waktu</Th></tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {rsvpList.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30">
                    <Td className="font-medium">{r.name}</Td>
                    <Td className="text-muted-foreground">{r.invitation}</Td>
                    <Td><StatusPill status={r.attend} /></Td>
                    <Td>{r.guest}</Td>
                    <Td className="max-w-xs truncate text-muted-foreground italic">"{r.message}"</Td>
                    <Td className="text-xs text-muted-foreground">{r.at}</Td>
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

function Th({ children }: { children: React.ReactNode }) { return <th className="text-left px-6 py-3 font-medium">{children}</th>; }
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <td className={`px-6 py-3 ${className}`}>{children}</td>; }
