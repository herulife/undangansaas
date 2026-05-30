import { createFileRoute } from "@tanstack/react-router";
import { Topbar, StatusPill } from "@/components/dashboard/Shared";
import { adminUsers } from "@/lib/mock";
import { Plus, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  return (
    <>
      <Topbar title="Kelola Users" subtitle={`${adminUsers.length} users terdaftar`}>
        <button className="inline-flex items-center gap-2 rounded-md hairline px-3 py-2 text-sm hover:bg-secondary"><Filter className="size-4" />Filter</button>
        <button className="inline-flex items-center gap-2 rounded-md bg-gold-gradient text-primary-foreground px-3 py-2 text-sm shadow-gold"><Plus className="size-4" />Tambah User</button>
      </Topbar>
      <div className="p-6">
        <div className="rounded-2xl bg-card hairline overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-6 py-3">Nama</th><th className="text-left px-6 py-3">Email</th><th className="text-left px-6 py-3">Plan</th><th className="text-left px-6 py-3">Undangan</th><th className="text-left px-6 py-3">Joined</th><th className="text-left px-6 py-3">Status</th><th className="text-right px-6 py-3">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-medium">{u.name[0]}</div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-3"><span className="text-gold text-xs">{u.plan}</span></td>
                  <td className="px-6 py-3">{u.invitations}</td>
                  <td className="px-6 py-3 text-muted-foreground">{u.joined}</td>
                  <td className="px-6 py-3"><StatusPill status={u.status} /></td>
                  <td className="px-6 py-3 text-right text-xs"><button className="text-gold hover:underline">Detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
