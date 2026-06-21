import type { Metadata } from 'next';

const BASE_URL = 'https://spartanclub.vercel.app';

export const metadata: Metadata = {
  title: 'Herramientas | Spartan Club - Asesor de Estilo y Análisis',
  description: 'Descubre nuestras herramientas de IA para análisis de estilo y forma de cara. Recomendaciones personalizadas para tu transformación.',
  keywords: ['herramientas', 'asesor estilo', 'análisis imagen', 'recomendaciones', 'IA'],
  openGraph: {
    title: 'Herramientas | Spartan Club',
    description: 'Herramientas de IA para tu transformación',
    type: 'website',
    url: `${BASE_URL}/herramientas`,
  },
  alternates: {
    canonical: `${BASE_URL}/herramientas`,
  },
};

export default function HerramientasLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#181111]">{children}</div>;
}
