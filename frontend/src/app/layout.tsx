// app/layout.tsx
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CookieConsent from "@/components/CookieConsent";
import { Inter, Noto_Sans } from "next/font/google";
import { assertEnvironment } from "@/lib/config/validate-env";
import type { Metadata, Viewport } from "next";

// Validate environment at startup time (not during build)
if (
  process.env.NODE_ENV === "production" &&
  typeof window === "undefined" &&
  !process.env.NEXT_PHASE?.includes("build")
) {
  assertEnvironment();
}

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

const BASE_URL = "https://spartanclub.vercel.app";

export const metadata: Metadata = {
  // ==================== Basic ====================
  title: {
    template: "%s | Spartan Club",
    default: "Spartan Club - Forja tu Potencial de Guerrero Espartano",
  },
  description:
    "Plataforma de desarrollo personal masculino. Accede a herramientas de IA, artículos sobre entrenamiento, estilo y mentalidad. Únete a la comunidad de hombres disciplinados en su búsqueda de excelencia.",
  keywords: [
    "desarrollo masculino",
    "autoayuda",
    "entrenamiento",
    "estilo de vida",
    "mentalidad",
    "comunidad",
    "asesor de estilo",
    "hombre spartano",
  ],

  // ==================== Metadata ====================
  authors: [{ name: "Spartan Club", url: BASE_URL }],
  creator: "Spartan Club",
  publisher: "Spartan Club",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },

  // ==================== Robots & Indexing ====================
  robots: {
    index: true,
    follow: true,
    nocache: false,
    nosnippet: false,
    noarchive: false,
    noimageindex: false,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ==================== Open Graph ====================
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    url: BASE_URL,
    siteName: "Spartan Club",
    title: "Spartan Club - Forja tu Potencial de Guerrero Espartano",
    description:
      "Herramientas de IA y comunidad para tu desarrollo personal masculino.",
    images: [
      {
        url: `${BASE_URL}/Hero.webp`,
        width: 1200,
        height: 630,
        alt: "Spartan Club - Forja tu Potencial",
        type: "image/png",
      },
    ],
  },

  // ==================== Twitter/X ====================
  twitter: {
    card: "summary_large_image",
    title: "Spartan Club",
    description: "Plataforma de desarrollo personal masculino",
    images: [`${BASE_URL}/Hero.webp`],
    creator: "@spartanclub",
    site: "@spartanclub",
  },

  // ==================== Icons & Theme ====================
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Spartan Club",
  },
  manifest: "/manifest.json",

  // ==================== Verification ====================
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },

  // ==================== Alternates ====================
  alternates: {
    canonical: BASE_URL,
    languages: {
      es: BASE_URL,
      en: `${BASE_URL}/en`,
    },
  },
};

// Viewport configuration (separated from metadata in Next.js 14+)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

// Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "Spartan Club",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    "@id": `${BASE_URL}/#logo`,
    url: `${BASE_URL}/Logo%20spartan%20club.webp`,
    width: 512,
    height: 512,
    caption: "Spartan Club",
  },
  image: {
    "@id": `${BASE_URL}/#logo`,
  },
  description:
    "Plataforma de desarrollo personal masculino con herramientas de IA y comunidad.",
  sameAs: [
    "https://twitter.com/spartanclub",
    "https://instagram.com/spartanclub",
    "https://youtube.com/@spartanclub",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
  },
  foundingDate: "2024",
  areaServed: {
    "@type": "Country",
    name: "CO",
  },
};

// WebSite Schema with SearchAction
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "Spartan Club",
  description: "Plataforma de desarrollo personal masculino",
  publisher: {
    "@id": `${BASE_URL}/#organization`,
  },
  potentialAction: [
    {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  ],
};

import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${notoSans.variable}`}>
      <head>
        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="relative flex size-full min-h-screen flex-col bg-[#141414] text-white font-sans">
        <Header />
        {children}
        <Footer />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
