import type { Metadata } from "next";
import ToolSeoContent from "@/components/seo/ToolSeoContent";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-[#181111] min-h-screen">{children}</div>
      <ToolSeoContent
        name={"el Asesor Personal de Estilo"}
        path={"/herramientas/asesor-estilo"}
        baseUrl={BASE_URL}
        intro={
          "El Asesor Personal de Estilo de Triarvon es una herramienta con inteligencia artificial que sugiere ropa y combinaciones a hombres de habla hispana. Analiza la foto que subes, estima tu tipo de cuerpo y propone outfits que se ajustan a esa morfología, para que vistas mejor sin depender de modas pasajeras."
        }
        steps={[
          "Sube una foto tuya de cuerpo completo, con buena luz y de frente.",
          "La inteligencia artificial analiza tu morfología y tus proporciones.",
          "Recibe recomendaciones de prendas, cortes y combinaciones que te favorecen.",
          "Ajusta lo que no te convence y vuelve a generar nuevas opciones.",
        ]}
        faqs={[
          {
            question: "¿Cómo funciona el asesor de estilo con IA?",
            answer:
              "Analizas una foto tuya con inteligencia artificial, que identifica tu tipo de cuerpo y propone prendas y combinaciones que se ajustan a él. El resultado son recomendaciones concretas de estilo masculino, no un número ni una calificación.",
          },
          {
            question: "¿Necesito pagar para usarlo?",
            answer:
              "Puedes empezar con créditos de prueba. Si quieres generar más recomendaciones, puedes comprar créditos adicionales dentro de la herramienta.",
          },
          {
            question: "¿Qué foto debo subir para obtener mejores resultados?",
            answer:
              "Una foto de cuerpo completo, de frente, con buena iluminación y ropa ajustada o simple. Las fotos borrosas o con varias personas dan recomendaciones menos precisas.",
          },
          {
            question: "¿Sirve si no vivo en Colombia?",
            answer:
              "Sí. Las recomendaciones de estilo se basan en tu cuerpo y en combinaciones de ropa, y funcionan para hombres de cualquier país de habla hispana.",
          },
        ]}
      />
    </>
  );
}
