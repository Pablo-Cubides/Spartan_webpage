import type { Metadata } from "next";
import ToolSeoContent from "@/components/seo/ToolSeoContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

export const metadata: Metadata = {
  title:
    "Análisis de Barba y Corte de Cabello según Forma de Cara | Triarvon Club",
  description:
    "Descubre la forma de tu rostro y recibe recomendaciones con IA para corte de cabello, estilo de barba y accesorios que mejor te favorecen.",
  keywords: [
    "asesor forma de cara",
    "tipo de rostro hombre",
    "corte de cabello segun forma de cara",
    "estilos de barba",
    "analisis facial IA",
    "grooming hombre",
    "triarvon club",
  ],
  openGraph: {
    title: "Análisis de Barba y Corte de Cabello con IA | Triarvon Club",
    description:
      "Descubre la forma de tu rostro y aprende a destacar tus mejores características con recomendaciones personalizadas.",
    type: "website",
    url: `${BASE_URL}/herramientas/asesor-forma-cara`,
    siteName: "Triarvon Club",
    images: [
      {
        url: `${BASE_URL}/Herramientas/Hombre con barba.png`,
        width: 1200,
        height: 630,
        alt: "Asesor Forma de Cara y Barba Triarvon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Análisis de Barba y Corte de Cabello con IA | Triarvon Club",
    description:
      "Descubre la forma de tu rostro y optimiza tu corte de pelo y barba con IA.",
    images: [`${BASE_URL}/Herramientas/Hombre con barba.png`],
  },
  alternates: {
    canonical: `${BASE_URL}/herramientas/asesor-forma-cara`,
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

export default function AsesorFormaCaraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Asesor de Forma de Cara y Estilo de Barba Triarvon",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    url: `${BASE_URL}/herramientas/asesor-forma-cara`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Prueba gratuita con créditos",
    },
    description:
      "Herramienta con IA para clasificar la forma de rostro masculino y sugerir cortes de cabello, barba y accesorios que potencian la simetría facial.",
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
        name={"el Asesor de Forma de Rostro"}
        path={"/herramientas/asesor-forma-cara"}
        baseUrl={BASE_URL}
        intro={
          "El Asesor de Forma de Rostro de Triarvon usa inteligencia artificial para identificar la forma de tu cara (ovalada, redonda, cuadrada, alargada, entre otras) y recomendarte el corte de cabello, el estilo de barba y los accesorios que mejor te favorecen. Sirve para decidir qué pedirle al barbero y para saber qué evitar."
        }
        steps={[
          "Sube una foto de frente, con el cabello hacia atrás y sin gafas.",
          "La IA identifica la forma de tu rostro y tus proporciones.",
          "Recibe recomendaciones de corte de cabello, estilo de barba y accesorios.",
          "Compara opciones y lleva la que más te guste a tu barbero.",
        ]}
        faqs={[
          {
            question: "¿Cómo sé qué forma de cara tengo?",
            answer:
              "La herramienta lo detecta a partir de una foto frontal: mide la relación entre frente, pómulos y mandíbula y la clasifica en una forma de rostro. También recibes una explicación de por qué ese tipo de cara se favorece con ciertos cortes.",
          },
          {
            question:
              "¿Qué corte de cabello y barba me favorecen según mi rostro?",
            answer:
              "Depende de tu forma de cara: por ejemplo, las caras redondas suelen verse mejor con volumen arriba y barba que alargue, y las cuadradas con cortes que suavicen la mandíbula. La herramienta te da opciones específicas para tu caso.",
          },
          {
            question: "¿Qué foto debo subir?",
            answer:
              "Una foto de frente, con buena luz, el cabello hacia atrás y sin gafas ni gorra, para que la IA vea bien la frente y la mandíbula.",
          },
          {
            question: "¿Tiene costo?",
            answer:
              "Puedes empezar con créditos de prueba y comprar más dentro de la herramienta si quieres generar nuevas recomendaciones.",
          },
        ]}
      />
    </>
  );
}
