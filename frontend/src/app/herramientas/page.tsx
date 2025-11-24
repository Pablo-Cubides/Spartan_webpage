'use client';

import Link from 'next/link';

const HERRAMIENTAS = [
  {
    id: 'asesor-forma-cara',
    titulo: 'Análisis de Barba y Corte de Cabello',
    descripcion: 'Descubre tu forma de cara y aprende a resaltar tus mejores rasgos. Obtén consejos personalizados sobre cortes de cabello, estilos de barba y accesorios que te favorecen.',
    imagen: encodeURI('/Herramientas/Hombre con barba.png'),
    estado: 'activo',
  },
  {
    id: 'personal-coach',
    titulo: 'Personal Coach Espartano',
    descripcion: 'Un programa de entrenamiento y mentoría personalizado para alcanzar tus metas de forma espartana.',
    imagen: encodeURI('/Herramientas/Guerrero spartano.png'),
    estado: 'proximamente',
  },
  {
    id: 'asesor-estilo',
    titulo: 'Tu Asesor de Estilo Personal',
    descripcion: 'Recibe recomendaciones de estilo adaptadas a tus preferencias y tipo de cuerpo. Crea un guardarropa que refleje tu personalidad y te haga sentir seguro en cualquier situación.',
    imagen: encodeURI('/Herramientas/Seleccionar ropa tool.png'),
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
                <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#181111] @[480px]:rounded-xl min-h-80" style={{ backgroundImage: `url(${encodeURI('/Herramientas/Hero_herramientas_spartan.jpg')})` }} />
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
