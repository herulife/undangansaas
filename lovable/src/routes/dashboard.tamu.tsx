import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { Upload, Plus, Send } from "lucide-react";
import { createGuest, importGuests, listGuests, listInvitations, sendGuestInvite, type ApiInvitation, type Guest } from "@/lib/api";

export const Route = createFileRoute("/dashboard/tamu")({
  component: TamuPage,
});

function TamuPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [invitations, setInvitations] = useState<ApiInvitation[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [message, setMessage] = useState("Memuat tamu...");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [csv, setCsv] = useState("");
  const [busyGuest, setBusyGuest] = useState("");

  useEffect(() => {
    listInvitations()
      .then((items) => {
        setInvitations(items);
        setSelectedSlug((current) => current || items[0]?.slug || "");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Gagal memuat undangan"));
  }, []);

  const loadGuests = async (slug = selectedSlug) => {
    if (!slug) {
      setGuests([]);
      setMessage("Buat undangan dulu sebelum menambah tamu.");
      return;
    }
    try {
      const data = await listGuests({ invitationSlug: slug });
      setGuests(data);
      setMessage(`${data.length} tamu terdaftar`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat tamu");
    }
  };

  useEffect(() => {
    if (selectedSlug) void loadGuests(selectedSlug);
  }, [selectedSlug]);

  const selectedInvitation = useMemo(() => invitations.find((item) => item.slug === selectedSlug), [invitations, selectedSlug]);

  const addGuest = async () => {
    if (!selectedSlug) return;
    setMessage("Menambah tamu...");
    try {
      await createGuest({ invitationSlug: selectedSlug, name: form.name, phone: form.phone });
      setForm({ name: "", phone: "" });
      await loadGuests(selectedSlug);
      setMessage("Tamu berhasil ditambahkan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menambah tamu");
    }
  };

  const importCsv = async () => {
    if (!selectedSlug || !csv.trim()) return;
    setMessage("Import CSV tamu...");
    try {
      await importGuests({ invitationSlug: selectedSlug, csv });
      setCsv("");
      await loadGuests(selectedSlug);
      setMessage("Import tamu berhasil.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal import tamu");
    }
  };

  const sendInvite = async (guest: Guest) => {
    setBusyGuest(guest.id);
    setMessage(`Menyiapkan link untuk ${guest.name}...`);
    try {
      const result = await sendGuestInvite(guest.id);
      await loadGuests(selectedSlug);
      setMessage("Link personal siap dikirim.");
      if (result.url) window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengirim link");
    } finally {
      setBusyGuest("");
    }
  };

  return (
    <>
      <Topbar title="Tamu Undangan" subtitle={message}>
        <button onClick={importCsv} className="inline-flex items-center gap-2 rounded-full hairline px-4 py-2 text-sm hover:bg-secondary"><Upload className="size-4" />Import CSV</button>
        <button onClick={addGuest} className="inline-flex items-center gap-2 rounded-full bg-gold-gradient text-primary-foreground px-4 py-2 text-sm shadow-gold"><Plus className="size-4" />Tambah Tamu</button>
      </Topbar>
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="rounded-2xl bg-card hairline p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} className="field">
              {invitations.map((invitation) => (
                <option key={invitation.id} value={invitation.slug}>{invitation.title}</option>
              ))}
            </select>
            <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} placeholder="Nama tamu" className="field" />
            <input value={form.phone} onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))} placeholder="No. WhatsApp" className="field" />
            <input value={csv} onChange={(event) => setCsv(event.target.value)} placeholder="CSV: Nama,0812..." className="field" />
          </div>
          {selectedInvitation && <p className="mt-3 text-xs text-muted-foreground">Link dasar: /u/{selectedInvitation.slug}?to=Nama+Tamu</p>}
        </div>

        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <div className="space-y-3 p-3 md:hidden">
            {guests.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada tamu untuk undangan ini.</div>}
            {guests.map((guest) => (
              <article key={guest.id} className="rounded-xl bg-secondary/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{guest.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{guest.phone || "-"}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{guest.invitationTitle}</p>
                  </div>
                  <StatusPill status={guestStatusLabel(guest.status)} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={guest.openedAt ? "text-xs text-emerald-400" : "text-xs text-muted-foreground"}>
                    {guest.openedAt ? "Sudah dibuka" : "Belum dibuka"}
                  </span>
                  <button
                    onClick={() => sendInvite(guest)}
                    disabled={busyGuest === guest.id}
                    className="inline-flex items-center gap-1 rounded-md bg-gold-gradient px-3 py-2 text-xs text-primary-foreground shadow-gold disabled:opacity-50"
                  >
                    <Send className="size-3" />Kirim WA
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
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
                {guests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">Belum ada tamu untuk undangan ini.</td>
                  </tr>
                )}
                {guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-3"><input type="checkbox" /></td>
                    <td className="px-6 py-3 font-medium">{guest.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{guest.phone || "-"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{guest.invitationTitle}</td>
                    <td className="px-6 py-3"><StatusPill status={guestStatusLabel(guest.status)} /></td>
                    <td className="px-6 py-3"><span className={guest.openedAt ? "text-emerald-400" : "text-muted-foreground"}>{guest.openedAt ? "Ya" : "-"}</span></td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => sendInvite(guest)}
                        disabled={busyGuest === guest.id}
                        className="inline-flex items-center gap-1 rounded-md hairline px-2.5 py-1 text-xs hover:bg-secondary disabled:opacity-50"
                      >
                        <Send className="size-3" />Kirim WA
                      </button>
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

function guestStatusLabel(status: Guest["status"]) {
  if (status === "sent") return "Sent";
  if (status === "opened") return "Opened";
  if (status === "failed") return "Failed";
  return "Draft";
}
