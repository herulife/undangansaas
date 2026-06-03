import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { Plus } from "lucide-react";
import { createAdminVoucher, listAdminVouchers, type Voucher } from "@/lib/api";

export const Route = createFileRoute("/admin/voucher")({
  component: VoucherPage,
});

function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [message, setMessage] = useState("Memuat voucher...");
  const [form, setForm] = useState({
    code: "",
    discountType: "percent" as Voucher["discountType"],
    discountValue: 20,
    quota: 100,
    expiresAt: "",
  });

  const load = async () => {
    try {
      const data = await listAdminVouchers();
      setVouchers(data);
      setMessage(`${data.length} voucher aktif/tersimpan`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat voucher");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createVoucher = async () => {
    setMessage("Membuat voucher...");
    try {
      await createAdminVoucher({
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        quota: Number(form.quota),
        expiresAt: form.expiresAt || undefined,
        status: "active",
      });
      setForm((current) => ({ ...current, code: "" }));
      await load();
      setMessage("Voucher berhasil dibuat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal membuat voucher");
    }
  };

  return (
    <>
      <Topbar title="Voucher & Promo" subtitle={message}>
        <button onClick={createVoucher} className="inline-flex items-center gap-2 rounded-md bg-gold-gradient text-primary-foreground px-3 py-2 text-sm shadow-gold"><Plus className="size-4" />Buat Voucher</button>
      </Topbar>
      <div className="p-6 space-y-6">
        <div className="rounded-2xl bg-card hairline p-5">
          <div className="grid gap-3 md:grid-cols-5">
            <input value={form.code} onChange={(event) => setForm((value) => ({ ...value, code: event.target.value.toUpperCase() }))} placeholder="Kode promo" className="field" />
            <select value={form.discountType} onChange={(event) => setForm((value) => ({ ...value, discountType: event.target.value as Voucher["discountType"] }))} className="field">
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
            <input type="number" value={form.discountValue} onChange={(event) => setForm((value) => ({ ...value, discountValue: Number(event.target.value) }))} placeholder="Nilai" className="field" />
            <input type="number" value={form.quota} onChange={(event) => setForm((value) => ({ ...value, quota: Number(event.target.value) }))} placeholder="Kuota" className="field" />
            <input type="date" value={form.expiresAt} onChange={(event) => setForm((value) => ({ ...value, expiresAt: event.target.value }))} className="field" />
          </div>
        </div>

        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left px-6 py-3">Kode</th><th className="text-left px-6 py-3">Diskon</th><th className="text-left px-6 py-3">Tipe</th><th className="text-left px-6 py-3">Terpakai</th><th className="text-left px-6 py-3">Kuota</th><th className="text-left px-6 py-3">Kadaluarsa</th><th className="text-left px-6 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {vouchers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">Belum ada voucher.</td>
                  </tr>
                )}
                {vouchers.map((voucher) => {
                  const pct = voucher.quota ? Math.min(100, (voucher.usedCount / voucher.quota) * 100) : 0;
                  return (
                    <tr key={voucher.id} className="hover:bg-secondary/30">
                      <td className="px-6 py-3"><span className="font-mono text-gold">{voucher.code}</span></td>
                      <td className="px-6 py-3 font-medium">{formatDiscount(voucher)}</td>
                      <td className="px-6 py-3 text-muted-foreground">{voucher.discountType}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 w-40">
                          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-gold-gradient" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{voucher.usedCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{voucher.quota}</td>
                      <td className="px-6 py-3 text-muted-foreground">{voucher.expiresAt ? formatDate(voucher.expiresAt) : "-"}</td>
                      <td className="px-6 py-3"><StatusPill status={statusLabel(voucher.status)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function formatDiscount(voucher: Voucher) {
  if (voucher.discountType === "percent") return `${voucher.discountValue}%`;
  return "Rp" + voucher.discountValue.toLocaleString("id-ID");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function statusLabel(status: Voucher["status"]) {
  if (status === "active") return "Active";
  if (status === "expired") return "Expired";
  return "Paused";
}
