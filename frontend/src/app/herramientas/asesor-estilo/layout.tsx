import type { Metadata } from "next";
import Script from "next/script";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

export const metadata: Metadata = {
  title: "Asesor Personal de Estilo con IA | Triarvon Club",
  description:
    "Recibe recomendaciones de estilo masculino y combinaciones de ropa según tu tipo de cuerpo y morfología con Inteligencia Artificial. Optimiza tu imagen personal.",
  keywords: [
    "asesor de estilo",
    "asesor de imagen masculina",
    "estilo hombre",
    "combinaciones de ropa hombre",
    "moda masculina IA",
    "outfits hombres",
    "triarvon club",
  ],
  openGraph: {
    title: "Asesor Personal de Estilo con IA | Triarvon Club",
    description:
      "Recomendaciones personalizadas de vestimenta y estilo masculino según tu morfología.",
    type: "website",
    url: `${BASE_URL}/herramientas/asesor-estilo`,
    siteName: "Triarvon Club",
    images: [
      {
        url: `${BASE_URL}/Herramientas/Seleccionar ropa tool.webp`,
        width: 1200,
        height: 630,
        alt: "Asesor Personal de Estilo Triarvon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asesor Personal de Estilo con IA | Triarvon Club",
    description:
      "Recomendaciones personalizadas de vestimenta y estilo masculino según tu morfología.",
    images: [`${BASE_URL}/Herramientas/Seleccionar ropa tool.webp`],
  },
  alternates: {
    canonical: `${BASE_URL}/herramientas/asesor-estilo`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function AsesorEstiloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Asesor Personal de Estilo Triarvon",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    url: `${BASE_URL}/herramientas/asesor-estilo`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Prueba gratuita con créditos",
    },
    description:
      "Herramienta con IA para análisis de tipo de cuerpo y generación de recomendaciones de estilo, outfits y combinaciones para hombres.",
    publisher: {
      "@type": "Organization",
      name: "Triarvon Club",
      url: BASE_URL,
    },
  };

  return (
    <>
      <Script
        id="asesor-estilo-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-[#181111] min-h-screen">{children}</div>
    </>
  );
}
