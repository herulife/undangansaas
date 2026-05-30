import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Templates } from "@/components/site/Templates";
import { Demo } from "@/components/site/Demo";
import { Pricing } from "@/components/site/Pricing";
import { Testimonials } from "@/components/site/Testimonials";
import { Faq } from "@/components/site/Faq";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Undanganku — Buat Undangan Online Premium dalam Hitungan Menit" },
      { name: "description", content: "Platform undangan digital premium: pilih template, isi detail, publish. RSVP, ucapan, gift, galeri — semua dalam satu link." },
      { property: "og:title", content: "Undanganku — Undangan Online Premium" },
      { property: "og:description", content: "Buat undangan digital mewah untuk wedding & acara spesial dalam hitungan menit." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Templates />
        <Demo />
        <Pricing />
        <Testimonials />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
