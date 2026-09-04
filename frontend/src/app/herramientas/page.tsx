"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";

// Nota: Metadata no puede estar en 'use client', mover a layout.tsx si se necesita
// export const metadata: Metadata = {
//   title: 'Herramientas | Triarvon Club - Asesor de Estilo y Análisis',
//   description: 'Descubre nuestras herramientas de IA...',
// };

const HERRAMIENTAS = [
  {
    id: "asesor-forma-cara",
    title: "Análisis de Barba y Corte de Cabello",
    description:
      "Descubre la forma de tu rostro y aprende a destacar tus mejores características. Obtén asesoramiento personalizado sobre cortes, estilos de barba y accesorios que te favorezcan.",
    image: encodeURI("/Herramientas/Hombre con barba.png"),
    status: "active",
  },
  {
    id: "couch_triarvono",
    title: "Triarvon Personal Coach",
    description:
      "Un programa personalizado de coaching con IA para alcanzar tus metas en Triarvon. Cuerpo, mentalidad, estilo y productividad.",
    image: encodeURI("/Herramientas/Guerrero triarvono.png"),
    status: "active",
  },
  {
    id: "asesor-estilo",
    title: "Tu Asesor Personal de Estilo",
    description:
      "Recibe recomendaciones de estilo personalizadas según tus preferencias y tipo de cuerpo. Crea un guardarropa que refleje tu personalidad y te haga sentir confiado en cualquier situación.",
    image: encodeURI("/Herramientas/Seleccionar ropa tool.webp"),
    status: "active",
  },
];

export default function HerramientasPage() {
  return (
    <div
      className="min-h-screen bg-[#0a0a0a]"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-col h-full layout-container grow">
        {/* Breadcrumb */}
        <div className="relative z-40 px-4 md:px-40 py-5">
          <Breadcrumb
            items={[
              { label: "Inicio", href: "/" },
              { label: "Herramientas", href: "/herramientas", current: true },
            ]}
          />
        </div>

        {/* Hero moved outside the centered container so bg-fixed works correctly */}
        <div className="w-full">
          <div className="relative h-[60vh] min-h-[360px] w-full flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
              style={{
                backgroundImage: `url(${encodeURI("/Herramientas/Hero_herramientas_triarvon.jpg")})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050505]"></div>
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
                Herramientas para tu Transformación
              </h1>
              <p className="text-gray-300 text-sm md:text-base">
                Descubre las herramientas diseñadas para impulsarte en tu camino
                hacia una vida más disciplinada y plena.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center flex-1 px-4 md:px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Grid de Herramientas */}
            <div className="grid grid-cols-1 gap-4 p-4">
              {HERRAMIENTAS.map((tool) => (
                <Link
                  key={tool.id}
                  href={
                    tool.status === "active" ? `/herramientas/${tool.id}` : "#"
                  }
                  className={`@container cursor-pointer transition-transform hover:scale-102 ${
                    tool.status === "soon"
                      ? "opacity-75 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={(e) => tool.status === "soon" && e.preventDefault()}
                >
                  <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] overflow-hidden hover:from-[#333333] hover:to-[#222222] transition-colors">
                    <div
                      className="w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl @xl:rounded-none @xl:w-96 flex-shrink-0"
                      style={{ backgroundImage: `url("${tool.image}")` }}
                    />
                    <div className="flex w-full grow flex-col items-stretch justify-center gap-2 p-4 @xl:px-6">
                      <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        {tool.title}
                      </h2>
                      <p className="text-gray-300 text-base font-normal leading-normal">
                        {tool.description}
                      </p>
                      {tool.status === "soon" && (
                        <p className="text-[#ff5252] text-sm font-semibold mt-2">
                          Próximamente
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Metodología y Beneficios de las Herramientas IA */}
            <div className="mt-12 space-y-10 border-t border-gray-800 pt-10 px-4">
              <section className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  ¿Por qué utilizar herramientas con Inteligencia Artificial en tu desarrollo personal?
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  En Triarvon combinamos principios clásicos de disciplina, entrenamiento físico y estilismo masculino con tecnología de visión artificial y modelos generativos de última generación. El objetivo no es reemplazar el criterio personal, sino ofrecerte una retroalimentación objetiva, precisa e inmediata adaptada a tu fisionomía, estilo de vida y metas individuales.
                </p>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#161616] p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-2 text-red-400">
                    Análisis Antropométrico
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Evaluamos proporciones faciales y silueta corporal mediante algoritmos de visión para sugerir peinados, barbas y prendas que equilibran tus facciones naturalmente.
                  </p>
                </div>
                <div className="bg-[#161616] p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-2 text-red-400">
                    Coaching Especializado 24/7
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Consultores virtuales enfocados en áreas críticas: acondicionamiento físico, nutrición, mentalidad estoica, gestión del tiempo y estilismo integral.
                  </p>
                </div>
                <div className="bg-[#161616] p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-2 text-red-400">
                    Privacidad y Cifrado
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Tus fotografías se procesan de forma privada y segura en servidores protegidos. No compartimos ni vendemos tu información visual a terceros.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Preguntas Frecuentes sobre las Herramientas
                </h2>
                <div className="space-y-4 text-gray-300 text-sm">
                  <div className="bg-[#141414] p-5 rounded-lg border border-gray-800/80">
                    <h4 className="font-semibold text-white text-base mb-1">
                      ¿Necesito pagar para probar el Asesor de Estilo y el Asesor de Rostro?
                    </h4>
                    <p>
                      No. Al registrarte en Triarvon obtienes créditos iniciales gratuitos para realizar tus primeros análisis y experimentar las recomendaciones de IA sin costo.
                    </p>
                  </div>
                  <div className="bg-[#141414] p-5 rounded-lg border border-gray-800/80">
                    <h4 className="font-semibold text-white text-base mb-1">
                      ¿Cómo debo tomar la fotografía para obtener el mejor resultado?
                    </h4>
                    <p>
                      Recomendamos una foto de frente, con iluminación neutra y uniforme, fondo despejado y sin accesorios como gafas oscuras o gorras que tapen la línea mandibular o el cabello.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* CTA final */}
            <div className="flex justify-center px-4 py-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#c20909] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-900/40"
              >
                <span className="truncate">
                  Explorar Herramientas Arriba ↑
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
