import { invitationTemplates } from "@/lib/templates";

export type InvitationStatus = "Published" | "Draft";

export type Invitation = {
  id: string;
  title: string;
  slug: string;
  template: string;
  templateSlug: string;
  status: InvitationStatus;
  views: number;
  rsvp: number;
  date: string;
  groom: string;
  bride: string;
  venue: string;
  city: string;
  akadTime: string;
  receptionTime: string;
  img: string;
};

export const userInvitations: Invitation[] = [
  {
    id: "inv-1",
    title: "Rara & Dimas",
    slug: "rara-dimas",
    template: "Sunda 050 Pro",
    templateSlug: "adat-sunda-050-pro-raras-danis",
    status: "Published",
    views: 1240,
    rsvp: 187,
    date: "2026-06-12",
    groom: "Dimas Putra",
    bride: "Rara Wijaya",
    venue: "Hotel Mulia, Jakarta",
    city: "Jakarta",
    akadTime: "08.00 WIB",
    receptionTime: "11.00 WIB",
    img: invitationTemplates[1].img,
  },
  {
    id: "inv-2",
    title: "Khitanan Arka",
    slug: "khitanan-arka",
    template: "Wayang Batik 042",
    templateSlug: "wedding-premium042-wayang-batik",
    status: "Draft",
    views: 0,
    rsvp: 0,
    date: "2026-07-20",
    groom: "Arka",
    bride: "Keluarga Pratama",
    venue: "Rumah Keluarga Pratama",
    city: "Yogyakarta",
    akadTime: "09.00 WIB",
    receptionTime: "10.00 WIB",
    img: invitationTemplates[5].img,
  },
  {
    id: "inv-3",
    title: "Sari & Bagus",
    slug: "sari-bagus",
    template: "Minang Klasik 050",
    templateSlug: "adat-minang-050-klasik-zahra-fadli",
    status: "Published",
    views: 642,
    rsvp: 89,
    date: "2026-08-01",
    groom: "Bagus Aditya",
    bride: "Sari Dewi",
    venue: "Pangeran Beach Hotel",
    city: "Padang",
    akadTime: "09.00 WIB",
    receptionTime: "12.00 WIB",
    img: invitationTemplates[2].img,
  },
  {
    id: "inv-4",
    title: "Alyssa & Rayhan",
    slug: "alyssa-rayhan",
    template: "Jawa Klasik 050",
    templateSlug: "adat-jawa-050-klasik-alyssa-rayhan",
    status: "Published",
    views: 320,
    rsvp: 41,
    date: "2026-05-20",
    groom: "Rayhan Pradipta",
    bride: "Alyssa Kirana",
    venue: "Pendopo Agung Royal Ambarrukmo",
    city: "Yogyakarta",
    akadTime: "08.00 WIB",
    receptionTime: "11.00 WIB",
    img: invitationTemplates[0].img,
  },
];

export function formatInvitationDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getTemplateBySlug(slug: string) {
  return invitationTemplates.find((template) => template.slug === slug) ?? invitationTemplates[0];
}
