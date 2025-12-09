import type { Metadata } from 'next';

const BASE_URL = 'https://spartanclub.co';

export const metadata: Metadata = {
    title: 'Coach Espartano | Spartan Club - Tu Coach Virtual de Desarrollo Personal',
    description: 'Coaching virtual con IA para tu desarrollo personal. Entrena tu cuerpo, mentalidad, estilo y productividad con coaches especializados.',
    keywords: ['coach virtual', 'desarrollo personal', 'coaching IA', 'mentalidad', 'entrenamiento', 'productividad'],
    openGraph: {
        title: 'Coach Espartano | Spartan Club',
        description: 'Tu coach virtual de desarrollo personal con IA',
        type: 'website',
        url: `${BASE_URL}/herramientas/couch_spartano`,
    },
    alternates: {
        canonical: `${BASE_URL}/herramientas/couch_spartano`,
    },
};

export default function CoachEspartanoLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            {children}
        </div>
    );
}
