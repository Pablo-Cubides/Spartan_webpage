'use client';

import Link from 'next/link';

const HERRAMIENTAS = [
  {
    id: 'asesor-forma-cara',
    title: 'Beard and Haircut Analysis',
    description: 'Discover your face shape and learn to highlight your best features. Get personalized advice on haircuts, beard styles, and accessories that suit you.',
    image: encodeURI('/Herramientas/Hombre con barba.png'),
    status: 'active',
  },
  {
    id: 'personal-coach',
    title: 'Spartan Personal Coach',
    description: 'A personalized training and mentorship program to achieve your goals in a spartan way.',
    image: encodeURI('/Herramientas/Guerrero spartano.png'),
    status: 'soon',
  },
  {
    id: 'asesor-estilo',
    title: 'Your Personal Style Advisor',
    description: 'Receive style recommendations tailored to your preferences and body type. Create a wardrobe that reflects your personality and makes you feel confident in any situation.',
    image: encodeURI('/Herramientas/Seleccionar ropa tool.png'),
    status: 'active',
  },
];

export default function HerramientasPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#181111] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="flex flex-col h-full layout-container grow">
        {/* Hero moved outside the centered container so bg-fixed works correctly */}
        <div className="w-full">
          <div className="relative h-[60vh] min-h-[360px] w-full flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
              style={{ backgroundImage: `url(${encodeURI('/Herramientas/Hero_herramientas_spartan.jpg')})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050505]"></div>
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">Tools for your Transformation</h1>
              <p className="text-[#ba9c9c] text-sm md:text-base">Discover the tools designed to propel you on your path to a more disciplined and fulfilling life.</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center flex-1 px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">

            {/* Grid de Herramientas */}
            <div className="grid grid-cols-1 gap-4 p-4">
              {HERRAMIENTAS.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.status === 'active' ? `/herramientas/${tool.id}` : '#'}
                  className={`@container cursor-pointer transition-transform hover:scale-102 ${
                    tool.status === 'soon' ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => tool.status === 'soon' && e.preventDefault()}
                >
                  <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] overflow-hidden hover:from-[#333333] hover:to-[#222222] transition-colors">
                    <div className="w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl @xl:rounded-none @xl:w-96 flex-shrink-0" style={{ backgroundImage: `url("${tool.image}")` }} />
                    <div className="flex w-full grow flex-col items-stretch justify-center gap-2 p-4 @xl:px-6">
                      <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">{tool.title}</p>
                      <p className="text-[#ba9c9c] text-base font-normal leading-normal">{tool.description}</p>
                      {tool.status === 'soon' && (
                        <p className="text-[#c20909] text-sm font-semibold mt-2">Coming Soon</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA final */}
            <div className="flex justify-center px-4 py-3">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#c20909] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors">
                <span className="truncate">Unleash your Spartan Potential</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
