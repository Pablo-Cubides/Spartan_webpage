import type { Metadata } from "next";
import ToolSeoContent from "@/components/seo/ToolSeoContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

export const metadata: Metadata = {
  title:
    "Coach Triarvon con IA | Coaching Personal Masculino 24/7 | Triarvon Club",
  description:
    "5 coaches especializados con inteligencia artificial para transformación masculina completa: Cuerpo, Estilo, Mentalidad, Productividad. Coaching personalizado 24/7, gratis para empezar.",
  keywords: [
    "coach triarvon",
    "coaching con inteligencia artificial",
    "coach personal IA",
    "entrenador virtual masculino",
    "coaching de transformación masculina",
    "asesor de estilo con IA",
    "coach de mentalidad online",
    "productividad con inteligencia artificial",
    "coach de cuerpo virtual",
    "desarrollo personal hombres",
    "coaching 24/7",
    "entrenador personal AI",
    "coach de disciplina",
    "mejora de estilo masculino",
    "coaching para hombres",
  ],
  openGraph: {
    title: "Coach Triarvon | Coaching con IA para Hombres",
    description:
      "5 coaches especializados: Cuerpo, Estilo, Mentalidad, Productividad. Transformación masculina con IA.",
    type: "website",
    url: `${BASE_URL}/herramientas/couch_triarvono`,
    images: [
      {
        url: `${BASE_URL}/Triarvon/triarvon-logo-black-background.png`,
        width: 1200,
        height: 630,
        alt: "Coach Triarvon - Coaching con IA",
      },
    ],
    siteName: "Triarvon Club",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coach Triarvon | Coaching con IA",
    description:
      "5 coaches especializados para transformación masculina completa",
    images: [`${BASE_URL}/Triarvon/triarvon-logo-black-background.png`],
  },
  alternates: {
    canonical: `${BASE_URL}/herramientas/couch_triarvono`,
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

export default function CoachTriarvonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Coach Triarvon",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "10 mensajes gratis por mes, luego sistema de créditos",
    },
    description:
      "5 coaches especializados con inteligencia artificial para transformación masculina: Cuerpo, Estilo, Mentalidad, Productividad y Coach General.",
    featureList: [
      "Coach de Cuerpo para entrenamiento y nutrición",
      "Coach de Estilo para imagen personal",
      "Coach de Mentalidad para disciplina y hábitos",
      "Coach de Productividad para organización",
      "Coach General para coordinación",
      "Conversaciones encriptadas",
      "Personalización con IA",
      "Disponible 24/7",
    ],
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
      <div className="bg-[#0a0a0a] min-h-screen">{children}</div>
      <ToolSeoContent
        name={"el Coach Triarvon"}
        path={"/herramientas/couch_triarvono"}
        baseUrl={BASE_URL}
        intro={
          "El Coach Triarvon es un asistente de inteligencia artificial para hombres de habla hispana que quieren mejorar su cuerpo, su estilo, su mentalidad y su productividad. Funciona como un chat: eliges el área en la que quieres trabajar y recibes orientación práctica, rutinas y hábitos para aplicar desde hoy."
        }
        steps={[
          "Elige el área en la que quieres trabajar: cuerpo, estilo, mentalidad o productividad.",
          "Cuéntale tu situación, tu objetivo y el tiempo que tienes disponible.",
          "Recibe un plan concreto con pasos que puedas aplicar esta semana.",
          "Vuelve a conversar para ajustar el plan a medida que avanzas.",
        ]}
        faqs={[
          {
            question: "¿Qué es el Coach Triarvon?",
            answer:
              "Es un asistente de inteligencia artificial de coaching personal para hombres, que responde por chat en áreas como entrenamiento, estilo, mentalidad y productividad, y propone pasos concretos en cada una.",
          },
          {
            question: "¿Reemplaza a un entrenador o a un médico?",
            answer:
              "No. Es una guía de hábitos y rutinas generales. Para lesiones, enfermedades o planes médicos, consulta siempre con un profesional de la salud.",
          },
          {
            question: "¿Cuánto cuesta empezar?",
            answer:
              "Puedes empezar gratis. Si necesitas más conversaciones, puedes comprar créditos dentro de la herramienta.",
          },
          {
            question: "¿En qué idioma funciona?",
            answer:
              "En español. Los ejemplos están pensados para hombres de Colombia, del resto de Latinoamérica y de España.",
          },
        ]}
      />
    </>
  );
}
