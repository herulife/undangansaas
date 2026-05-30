import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatCard, StatusPill } from "@/components/dashboard/Shared";
import { Download, Loader2, RefreshCcw } from "lucide-react";
import { listInvitationRSVPs, listInvitations, type ApiInvitation, type RSVPItem } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard/rsvp")({
  component: RsvpPage,
});

type RSVPRow = RSVPItem & {
  invitationTitle: string;
  invitationSlug: string;
};

function RsvpPage() {
  const [invitations, setInvitations] = useState<ApiInvitation[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [rows, setRows] = useState<RSVPRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const filteredRows = useMemo(() => {
    if (!selectedSlug) return rows;
    return rows.filter((row) => row.invitationSlug === selectedSlug);
  }, [rows, selectedSlug]);

  const attend = filteredRows.filter((row) => row.status === "attending").length;
  const declined = filteredRows.filter((row) => row.status === "declined").length;
  const pending = filteredRows.filter((row) => row.status === "pending").length;
  const totalGuests = filteredRows.reduce((sum, row) => sum + row.guests, 0);

  const loadData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const invitationItems = await listInvitations();
      setInvitations(invitationItems);
      const allRows = await Promise.all(
        invitationItems.map(async (invitation) => {
          const rsvps = await listInvitationRSVPs(invitation.slug);
          return rsvps.map((rsvp) => ({
            ...rsvp,
            invitationTitle: invitation.title || invitation.couple,
            invitationSlug: invitation.slug,
          }));
        }),
      );
      setRows(allRows.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat RSVP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCsv = () => {
    const csv = [
      ["nama", "undangan", "status", "jumlah_tamu", "ucapan", "waktu"],
      ...filteredRows.map((row) => [
        row.name,
        row.invitationTitle,
        statusLabel(row.status),
        String(row.guests),
        row.message.replace(/\r?\n/g, " "),
        row.createdAt,
      ]),
    ]
      .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rsvp-${selectedSlug || "semua"}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Topbar title="RSVP & Ucapan" subtitle={message || (loading ? "Memuat RSVP dari database..." : `${filteredRows.length} RSVP dari database`)}>
        <select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} className="hidden rounded-md bg-secondary/60 px-3 py-2 text-sm outline-none md:block">
          <option value="">Semua undangan</option>
          {invitations.map((invitation) => (
            <option key={invitation.id} value={invitation.slug}>{invitation.title || invitation.couple}</option>
          ))}
        </select>
        <button onClick={loadData} className="inline-flex items-center gap-2 rounded-full hairline px-4 py-2 text-sm hover:bg-secondary">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
          Reload
        </button>
        <button onClick={exportCsv} disabled={!filteredRows.length} className="inline-flex items-center gap-2 rounded-full hairline px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50">
          <Download className="size-4" />Export CSV
        </button>
      </Topbar>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total RSVP" value={String(filteredRows.length)} accent="gold" />
          <StatCard label="Hadir" value={String(attend)} accent="success" />
          <StatCard label="Tidak Hadir" value={String(declined)} accent="danger" />
          <StatCard label="Tentative" value={String(pending)} accent="warning" />
          <StatCard label="Total Tamu" value={String(totalGuests)} accent="info" />
        </div>

        <div className="rounded-lg bg-card hairline overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-serif text-lg">Daftar Konfirmasi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><Th>Nama</Th><Th>Undangan</Th><Th>Status</Th><Th>Tamu</Th><Th>Ucapan</Th><Th>Waktu</Th></tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-secondary/30">
                    <Td className="font-medium">{row.name}</Td>
                    <Td className="text-muted-foreground">{row.invitationTitle}</Td>
                    <Td><StatusPill status={statusLabel(row.status)} /></Td>
                    <Td>{row.guests}</Td>
                    <Td className="max-w-xs truncate text-muted-foreground italic">"{row.message}"</Td>
                    <Td className="text-xs text-muted-foreground">{formatDateTime(row.createdAt)}</Td>
                  </tr>
                ))}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">Belum ada RSVP untuk filter ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function statusLabel(status: RSVPItem["status"]) {
  switch (status) {
    case "attending":
      return "Hadir";
    case "declined":
      return "Tidak Hadir";
    default:
      return "Ragu-ragu";
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-6 py-3 font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-3 ${className}`}>{children}</td>;
}
