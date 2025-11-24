// app/nosotros/page.tsx
'use client';

import Link from 'next/link';

export default function NosotrosPage() {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#121416] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-col h-full layout-container grow">
        {/* SIN HEADER */}

        <div className="flex justify-center flex-1 px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">

            {/* Título */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                Sobre Nosotros
              </p>
            </div>

            {/* Imagen de equipo o misión */}
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-[#121416] @[480px]:rounded-xl min-h-80"
                  style={{
                    backgroundImage:
                      'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 35%), url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=960&q=80")',
                  }}
                >
                  <div className="flex justify-center gap-2 p-5">
                    <div className="size-1.5 rounded-full bg-[#121416]"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción/Misión */}
            <div className="p-4">
              <div className="flex flex-col gap-3 rounded-xl bg-[#181a1d] p-6">
                <h2 className="mb-2 text-xl font-bold leading-tight text-white">Nuestra Misión</h2>
                <p className="text-[#a2aab3] text-base font-normal leading-normal">
                  En <span className="font-bold text-white">Spartan Club</span>, creemos en el poder transformador de la disciplina, la hermandad y la resiliencia.
                  Nuestra misión es guiar a los hombres modernos a forjar su carácter y desarrollar el potencial de liderazgo, ayudándolos a enfrentar los desafíos de la vida con coraje y propósito.
                </p>
              </div>
            </div>

            {/* Valores */}
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="bg-[#181a1d] rounded-xl p-5 flex flex-col gap-2 items-center text-center">
                  <span className="text-[#C62828] font-bold text-2xl">Disciplina</span>
                  <p className="text-[#a2aab3] text-sm">La disciplina es la base de toda transformación. Nos impulsa a crecer y a mantenernos firmes ante la adversidad.</p>
                </div>
                <div className="bg-[#181a1d] rounded-xl p-5 flex flex-col gap-2 items-center text-center">
                  <span className="text-[#C62828] font-bold text-2xl">Hermandad</span>
                  <p className="text-[#a2aab3] text-sm">Fomentamos una comunidad de apoyo, inspiración y respeto donde cada hombre es parte fundamental del crecimiento de todos.</p>
                </div>
                <div className="bg-[#181a1d] rounded-xl p-5 flex flex-col gap-2 items-center text-center">
                  <span className="text-[#C62828] font-bold text-2xl">Liderazgo</span>
                  <p className="text-[#a2aab3] text-sm">Formamos líderes capaces de influir positivamente, transformar su entorno y dejar un legado inspirador.</p>
                </div>
              </div>
            </div>

            {/* Team / Equipo */}
            <div className="p-4">
              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">
                Nuestro Equipo
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                <div className="flex flex-col items-center gap-2 bg-[#181a1d] rounded-xl p-5">
                  <div
                    className="w-20 h-20 bg-center bg-cover rounded-full"
                    style={{
                      backgroundImage:
                        'url("https://randomuser.me/api/portraits/men/10.jpg")',
                    }}
                  ></div>
                  <span className="font-bold text-white">Carlos Rivas</span>
                  <span className="text-[#a2aab3] text-sm">Fundador & Coach</span>
                </div>
                <div className="flex flex-col items-center gap-2 bg-[#181a1d] rounded-xl p-5">
                  <div
                    className="w-20 h-20 bg-center bg-cover rounded-full"
                    style={{
                      backgroundImage:
                        'url("https://randomuser.me/api/portraits/men/20.jpg")',
                    }}
                  ></div>
                  <span className="font-bold text-white">Andrés Gómez</span>
                  <span className="text-[#a2aab3] text-sm">Mentor de Resiliencia</span>
                </div>
                <div className="flex flex-col items-center gap-2 bg-[#181a1d] rounded-xl p-5">
                  <div
                    className="w-20 h-20 bg-center bg-cover rounded-full"
                    style={{
                      backgroundImage:
                        'url("https://randomuser.me/api/portraits/men/30.jpg")',
                    }}
                  ></div>
                  <span className="font-bold text-white">Sergio López</span>
                  <span className="text-[#a2aab3] text-sm">Estratega de Liderazgo</span>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="p-4">
              <div className="flex flex-col gap-3 rounded-xl bg-[#181a1d] p-6 text-center">
                <h2 className="mb-2 text-xl font-bold leading-tight text-white">Comunícate con Nosotros</h2>
                <p className="text-[#a2aab3] text-base font-normal leading-normal">
                  ¿Tienes preguntas, sugerencias o quieres colaborar? Estamos aquí para escucharte.
                  <br />
                  Envíanos un correo a{' '}
                  <a href="mailto:spartanmarketcol@gmail.com" className="text-[#C62828] hover:underline">
                    spartanmarketcol@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* CTA final */}
            <div className="flex flex-col items-center justify-center p-8">
              <h2 className="mb-2 text-2xl font-bold leading-tight text-center text-white">
                ¿Listo para unirte a la hermandad?
              </h2>
              <p className="text-[#a2aab3] text-base font-normal leading-normal text-center mb-4 max-w-xl">
                Forma parte de una comunidad que inspira, reta y apoya el crecimiento masculino auténtico.
              </p>
              <Link href="/perfil" className="rounded-full bg-[#C62828] px-6 py-3 font-bold text-white text-base hover:bg-[#a21d1d] transition">
                Únete ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
