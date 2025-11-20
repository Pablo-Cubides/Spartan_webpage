'use client';

import Link from 'next/link';

const HERRAMIENTAS = [
  {
    id: 'asesor-forma-cara',
    titulo: 'Análisis de Forma de Cara',
    descripcion: 'Descubre tu forma de cara y aprende a resaltar tus mejores rasgos. Obtén consejos personalizados sobre cortes de cabello, estilos de barba y accesorios que te favorecen.',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWAkIQ2n_BFtVcKepHBk-OR-XG8LZLHd86zkvpHhTtC62RYhrdOsnAQWJKjEke1QySVGsHaOUA3nrS-8E49d5MxoDX-3Ujs3WMqthrF8dxkxqhoQ7lm3YSWHh6lsF96bc_E4TAJh9E3ugrMWvDL8VPrlfBf9UvYOjH3_0aXoje1yh4ZHpkLcenNcAOzUjqi0KDKz87vN7i7_UvM0xUx1hKMcVJ9agia-Y_eP9FbyWXHjZPakDudPNJYT7VR0gXs_Kj22-eN5MgkwVo',
    estado: 'activo',
  },
  {
    id: 'selector-barba',
    titulo: 'Selector de Barba',
    descripcion: 'Encuentra el estilo de barba perfecto que complemente tu rostro y personalidad. Explora diferentes opciones y visualiza cómo lucirías con cada una.',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpJ2t-BK4XnXZ3YhXCCV2a-eO6tcya-iQRqfw4bv9stM3jRSnGnjE_NNH_DgRh_N9fEeYSUftaDz_gcuMcUXnQBeCgcrrPqrc0kDHKsdPmxOpyVGhko6J5lC8mgest93623LxhkYFcSBDARr7xQLrTP6EJnEAthGp9fuVTKeI8Rg9bmDVax7MXakWRF8pjGvDRODchR0uMrqPMpawKN-2J6LX87gP4caQVdzqZwboERdn-wRXo8UNF6IZWoVumiijU0fopX2zm9jf2',
    estado: 'proximamente',
  },
  {
    id: 'personal-shopper',
    titulo: 'Tu Asesor de Estilo Personal',
    descripcion: 'Recibe recomendaciones de estilo adaptadas a tus preferencias y tipo de cuerpo. Crea un guardarropa que refleje tu personalidad y te haga sentir seguro en cualquier situación.',
    imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF3dij4jWToqfPhbNaGRBCKsokVt-ZPF6mJjCafp2tOSRSN2zuEWXNNMNt7xO_ElnDlc_eTqsMejtr9QGAuFdpSQf1LvV78c6URVzLEx0bi1gU2MZv2HvZCC_CRlj8DdzedP20RI12Gb8sDWjD-F4N5O6m4B-i0VtDz-BydV_ExT4iUhbzDnQpTlQT67tVLL-c8Itk8UDT__LLbo4K_q230JFTClVK0Em3d-qHQHT7uR-a9A7NU3o7C4xhyCdZlALZN1zmBWnQfunr',
    estado: 'activo',
  },
];

export default function HerramientasPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#181111] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="flex flex-col h-full layout-container grow">
        <div className="flex justify-center flex-1 px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Hero */}
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#181111] @[480px]:rounded-xl min-h-80" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAFuGAc26b2xE51H1F3cHUAkIrRNWGzpUGzMarDhc-AM1N2WPSQ00JGsEuvQi4SqUcSFxFS8l4x_nZcPjRPCJ5cfW965kA2dNc5Plu2HzWSY5gnB103sxl0MJ9T3ZPjxO9wltKrvC2jm7MW5vKK8yWEkH_dEdcsLra_ZN2B9-_xZW2wxkPkBp7CukwEeS68M-Wb6EDdCgD_AHjxei_qR4yBLAYujiqJ94por5z7N3OvaA5iKHrSjQEmH9qeQoiPI33JFO2l2hs3yhES")' }} />
              </div>
            </div>

            {/* Título y descripción */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex flex-col gap-3 min-w-72">
                <p className="text-white tracking-light text-[32px] font-bold leading-tight">Herramientas para tu Transformación</p>
                <p className="text-[#ba9c9c] text-sm font-normal leading-normal">Descubre las herramientas diseñadas para impulsarte en tu camino hacia una vida más disciplinada y plena.</p>
              </div>
            </div>

            {/* Grid de Herramientas */}
            <div className="grid grid-cols-1 gap-4 p-4">
              {HERRAMIENTAS.map((herramienta) => (
                <Link
                  key={herramienta.id}
                  href={herramienta.estado === 'activo' ? `/herramientas/${herramienta.id}` : '#'}
                  className={`@container cursor-pointer transition-transform hover:scale-102 ${
                    herramienta.estado === 'proximamente' ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => herramienta.estado === 'proximamente' && e.preventDefault()}
                >
                  <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] overflow-hidden hover:from-[#333333] hover:to-[#222222] transition-colors">
                    <div className="w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl @xl:rounded-none @xl:w-96 flex-shrink-0" style={{ backgroundImage: `url("${herramienta.imagen}")` }} />
                    <div className="flex w-full grow flex-col items-stretch justify-center gap-2 p-4 @xl:px-6">
                      <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">{herramienta.titulo}</p>
                      <p className="text-[#ba9c9c] text-base font-normal leading-normal">{herramienta.descripcion}</p>
                      {herramienta.estado === 'proximamente' && (
                        <p className="text-[#c20909] text-sm font-semibold mt-2">Próximamente</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA final */}
            <div className="flex justify-center px-4 py-3">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#c20909] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors">
                <span className="truncate">Desata tu Potencial Espartano</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
