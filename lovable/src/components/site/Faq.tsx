import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Berapa lama undangan aktif?", a: "Paket Creator & Pro aktif selama 12 bulan sejak publish. Bisa diperpanjang kapan saja." },
  { q: "Apakah bisa custom domain?", a: "Bisa di paket Pro & Business. Cukup arahkan domain kamu ke server kami." },
  { q: "Bisa upload foto sendiri?", a: "Tentu. Galeri foto, cover, dan musik latar bisa diunggah langsung dari dashboard." },
  { q: "Bagaimana cara pembayaran?", a: "Mendukung QRIS, transfer bank, e-wallet (OVO, DANA, GoPay), dan kartu kredit." },
  { q: "Apakah ada refund?", a: "Garansi 7 hari uang kembali jika belum dipublish. Hubungi support kami via WhatsApp." },
];

export function Faq() {
  return (
    <section id="faq" className="py-24 border-t border-border/50">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <p className="text-sm text-gold tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="font-serif text-4xl md:text-5xl">Pertanyaan yang sering diajukan</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl bg-card hairline px-6 border-0">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
