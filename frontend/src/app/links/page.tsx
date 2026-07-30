import type { Metadata } from "next";
import LinktreeView from "@/components/LinktreeView";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

export const metadata: Metadata = {
  title: "Enlaces Oficiales & Redes | Triarvon",
  description:
    "Accede a todos los enlaces oficiales de Triarvon: página web, Instagram, Facebook, X (Twitter) y herramientas de alto rendimiento masculino.",
  alternates: {
    canonical: `${BASE_URL}/links`,
  },
  openGraph: {
    title: "Enlaces Oficiales & Redes | Triarvon",
    description:
      "Accede a la página oficial, Instagram, Facebook, X y herramientas de IA de Triarvon.",
    url: `${BASE_URL}/links`,
    siteName: "Triarvon",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/Triarvon/triarvon-logo-black-background.png`,
        width: 1200,
        height: 630,
        alt: "Triarvon - Enlaces Oficiales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enlaces Oficiales & Redes | Triarvon",
    description:
      "Página web oficial, redes sociales (Instagram, Facebook, X) y herramientas de Triarvon.",
    images: [`${BASE_URL}/Triarvon/triarvon-logo-black-background.png`],
  },
};

export default function LinksPage() {
  return <LinktreeView />;
}
