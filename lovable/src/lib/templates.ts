import adatJawa050 from "@/assets/template-previews/adat-jawa-050-klasik-alyssa-rayhan.webp";
import adatJawaKatsudoto from "@/assets/template-previews/adat-jawa-alyssa-rayhan-katsudoto.png";
import adatJawaOptimized from "@/assets/template-previews/adat-jawa-alyssa-rayhan-optimized.png";
import adatMinang050 from "@/assets/template-previews/adat-minang-050-klasik-zahra-fadli.webp";
import adatSundaPro from "@/assets/template-previews/adat-sunda-050-pro-raras-danis.webp";
import adatSundaAdapted from "@/assets/template-previews/adat-sunda-050-style-adapted.webp";
import premium042 from "@/assets/template-previews/wedding-premium042-wayang-batik.jpg";
import premium050 from "@/assets/template-previews/wedding-premium050-pixel-clean.webp";
import premium074 from "@/assets/template-previews/wedding-premium074-indonesia-editorial.png";

export type InvitationTemplate = {
  id: number;
  slug: string;
  name: string;
  category: string;
  tier: "Free" | "Creator" | "Pro";
  tag: string;
  status: "Published" | "Draft";
  uses: number;
  img: string;
  previewUrl: string;
};

export const invitationTemplates: InvitationTemplate[] = [
  { id: 1, slug: "adat-jawa-050-klasik-alyssa-rayhan", name: "Jawa Klasik 050", category: "Adat Jawa", tier: "Pro", tag: "Klasik", status: "Published", uses: 820, img: adatJawa050, previewUrl: "/templates/adat-jawa-050-klasik-alyssa-rayhan/index.html" },
  { id: 2, slug: "adat-sunda-050-pro-raras-danis", name: "Sunda 050 Pro", category: "Adat Sunda", tier: "Pro", tag: "Premium", status: "Published", uses: 640, img: adatSundaPro, previewUrl: "/templates/adat-sunda-050-pro-raras-danis/index.html" },
  { id: 3, slug: "adat-minang-050-klasik-zahra-fadli", name: "Minang Klasik 050", category: "Adat Minang", tier: "Pro", tag: "Songket", status: "Published", uses: 510, img: adatMinang050, previewUrl: "/templates/adat-minang-050-klasik-zahra-fadli/index.html" },
  { id: 4, slug: "wedding-premium074-indonesia-editorial", name: "Indonesia Editorial 074", category: "Wedding", tier: "Creator", tag: "Editorial", status: "Published", uses: 780, img: premium074, previewUrl: "/templates/wedding-premium074-indonesia-editorial/index.html" },
  { id: 5, slug: "wedding-premium050-pixel-clean", name: "Wedding Premium 050", category: "Wedding", tier: "Pro", tag: "Floral", status: "Published", uses: 940, img: premium050, previewUrl: "/templates/wedding-premium050-pixel-clean/index.html" },
  { id: 6, slug: "wedding-premium042-wayang-batik", name: "Wayang Batik 042", category: "Adat Jawa", tier: "Creator", tag: "Batik", status: "Published", uses: 430, img: premium042, previewUrl: "/templates/wedding-premium042-wayang-batik/index.html" },
  { id: 7, slug: "adat-jawa-alyssa-rayhan-optimized", name: "Alyssa Rayhan Optimized", category: "Adat Jawa", tier: "Creator", tag: "Optimized", status: "Published", uses: 360, img: adatJawaOptimized, previewUrl: "/templates/adat-jawa-alyssa-rayhan-optimized/index.html" },
  { id: 8, slug: "adat-sunda-050-style-adapted", name: "Sunda Style Adapted", category: "Adat Sunda", tier: "Creator", tag: "Adapted", status: "Published", uses: 290, img: adatSundaAdapted, previewUrl: "/templates/adat-sunda-050-style-adapted/index.html" },
  { id: 9, slug: "adat-jawa-alyssa-rayhan-katsudoto", name: "Alyssa Rayhan Katsudoto", category: "Adat Jawa", tier: "Pro", tag: "Clone", status: "Draft", uses: 180, img: adatJawaKatsudoto, previewUrl: "/templates/adat-jawa-alyssa-rayhan-katsudoto/index.html" },
];
