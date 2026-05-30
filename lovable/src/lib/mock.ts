// Centralized mock data for dashboards. Replace with real backend later.
export { userInvitations } from "@/lib/invitations";
import { invitationTemplates } from "@/lib/templates";

export const templateImages = invitationTemplates.map((template) => template.img);

export const rsvpList = [
  { id: 1, name: "Bagas Pratama", invitation: "Rara & Dimas", attend: "Hadir", guest: 2, message: "Selamat menempuh hidup baru!", at: "2 jam lalu" },
  { id: 2, name: "Dewi Lestari", invitation: "Rara & Dimas", attend: "Hadir", guest: 1, message: "Barakallah", at: "4 jam lalu" },
  { id: 3, name: "Rizky H.", invitation: "Sari & Bagus", attend: "Tidak Hadir", guest: 0, message: "Maaf tidak bisa hadir, doa terbaik.", at: "1 hari lalu" },
  { id: 4, name: "Putri A.", invitation: "Rara & Dimas", attend: "Hadir", guest: 2, message: "Bahagia selalu kalian!", at: "1 hari lalu" },
  { id: 5, name: "Andre", invitation: "Alyssa & Rayhan", attend: "Ragu-ragu", guest: 1, message: "Insyaallah hadir.", at: "2 hari lalu" },
];

export const guestList = [
  { id: 1, name: "Bagas Pratama", phone: "0812-1111-2222", invitation: "Rara & Dimas", status: "Sent", opened: true },
  { id: 2, name: "Dewi Lestari", phone: "0812-3333-4444", invitation: "Rara & Dimas", status: "Sent", opened: true },
  { id: 3, name: "Rizky H.", phone: "0812-5555-6666", invitation: "Sari & Bagus", status: "Sent", opened: false },
  { id: 4, name: "Putri A.", phone: "0813-7777-8888", invitation: "Rara & Dimas", status: "Sent", opened: true },
  { id: 5, name: "Andre", phone: "0813-9999-0000", invitation: "Alyssa & Rayhan", status: "Pending", opened: false },
  { id: 6, name: "Maya Sari", phone: "0813-1212-3434", invitation: "Sari & Bagus", status: "Pending", opened: false },
];

// Admin data
export const adminUsers = [
  { id: 1, name: "Rara Wijaya", email: "rara@mail.com", plan: "Pro", invitations: 2, joined: "12 Mar 2026", status: "Active" },
  { id: 2, name: "Sari Dewi", email: "sari@mail.com", plan: "Creator", invitations: 1, joined: "02 Apr 2026", status: "Active" },
  { id: 3, name: "Yudha Pratama", email: "yudha@mail.com", plan: "Free", invitations: 1, joined: "18 Apr 2026", status: "Active" },
  { id: 4, name: "Putri Hidayah", email: "putri@wo.com", plan: "Business", invitations: 24, joined: "05 Jan 2026", status: "Active" },
  { id: 5, name: "Andika R.", email: "andika@mail.com", plan: "Free", invitations: 0, joined: "20 May 2026", status: "Suspended" },
];

export const adminOrders = [
  { id: "ORD-2042", user: "Rara Wijaya", plan: "Pro", amount: 199000, method: "QRIS", status: "Paid", date: "28 May 2026" },
  { id: "ORD-2041", user: "Sari Dewi", plan: "Creator", amount: 99000, method: "BCA", status: "Paid", date: "27 May 2026" },
  { id: "ORD-2040", user: "Putri Hidayah", plan: "Business", amount: 499000, method: "Credit Card", status: "Paid", date: "26 May 2026" },
  { id: "ORD-2039", user: "Andika R.", plan: "Creator", amount: 99000, method: "GoPay", status: "Pending", date: "26 May 2026" },
  { id: "ORD-2038", user: "Yudha Pratama", plan: "Pro", amount: 199000, method: "OVO", status: "Failed", date: "25 May 2026" },
];

export const adminVouchers = [
  { id: 1, code: "WEDDING50", discount: "50%", type: "Percent", used: 124, quota: 500, expires: "30 Jun 2026", status: "Active" },
  { id: 2, code: "FREESHIP", discount: "Rp50.000", type: "Fixed", used: 89, quota: 200, expires: "15 Jul 2026", status: "Active" },
  { id: 3, code: "EARLYBIRD", discount: "30%", type: "Percent", used: 200, quota: 200, expires: "01 Apr 2026", status: "Expired" },
  { id: 4, code: "RESELLER10", discount: "10%", type: "Percent", used: 41, quota: 1000, expires: "31 Dec 2026", status: "Active" },
];

export const adminTemplates = invitationTemplates.map((template) => ({
  ...template,
  price: template.tier,
}));

export const adminKpi = {
  users: 12480,
  revenue: 184500000,
  invitations: 8260,
  rsvp: 124800,
  chart: [12, 19, 17, 22, 28, 24, 31, 36, 33, 41, 45, 52],
};
