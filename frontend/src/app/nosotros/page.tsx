// app/nosotros/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Nosotros - Spartan Club',
  description: 'Conoce nuestra misión, visión y el código que guía a Spartan Club.',
};

export default function NosotrosPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#101010] font-display text-[#D1D5DB] overflow-x-hidden">
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          {/* HERO */}
          <section className="@container py-8 md:py-12">
            <div className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:gap-12">
              <div className="md:w-1/2 flex flex-col gap-6">
                <div>
                  <h1 className="text-white text-4xl font-extrabold leading-tight uppercase md:text-5xl">NOSOTROS</h1>
                  <p className="mt-3 text-[#BDBDBD] text-base md:text-lg">Nuestra misión es empoderarte con las herramientas para conquistar tus metas. Somos una hermandad de hombres disciplinados que lideran con el ejemplo.</p>
                </div>
                <Link href="/herramientas" className="inline-block w-fit">
                  <span className="inline-flex items-center justify-center rounded-lg bg-[#D32F2F] px-6 py-3 text-white font-bold uppercase hover:bg-red-700 transition">Únete a la Legión</span>
                </Link>
              </div>
              <div className="md:w-1/2 w-full">
                <div className="w-full rounded-xl overflow-hidden bg-center bg-cover aspect-square" style={{ backgroundImage: "url('/Hero.png')" }} aria-hidden />
              </div>
            </div>
          </section>

          {/* Misión / Visión */}
          <section className="py-10 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-start gap-4 p-6 bg-[#222] rounded-xl">
                <span className="material-symbols-outlined text-[#D32F2F] text-4xl">flag</span>
                <h3 className="text-white text-2xl font-extrabold uppercase">Nuestra Misión</h3>
                <p className="text-[#BDBDBD]">Empoderar a cada hombre con las herramientas, el conocimiento y la disciplina necesarios para forjar su mejor versión y construir una vida de propósito.</p>
              </div>
              <div className="flex flex-col items-start gap-4 p-6 bg-[#222] rounded-xl">
                <span className="material-symbols-outlined text-[#D32F2F] text-4xl">visibility</span>
                <h3 className="text-white text-2xl font-extrabold uppercase">Nuestra Visión</h3>
                <p className="text-[#BDBDBD]">Ser la hermandad de referencia para hombres que buscan la excelencia, creando líderes que impacten positivamente en sus comunidades.</p>
              </div>
            </div>
          </section>

          {/* El Código */}
          <section className="py-10 md:py-16">
            <h2 className="text-white text-3xl font-extrabold uppercase text-center mb-8">El Código</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-4 p-6 bg-[#222] rounded-xl">
                <span className="material-symbols-outlined text-[#D32F2F] text-4xl">calendar_month</span>
                <p className="text-white text-xl font-bold uppercase">Disciplina</p>
                <p className="text-[#BDBDBD]">Compromiso inquebrantable con la consistencia y el autocontrol diario para forjar carácter.</p>
              </div>
              <div className="flex flex-col gap-4 p-6 bg-[#222] rounded-xl">
                <span className="material-symbols-outlined text-[#D32F2F] text-4xl">groups</span>
                <p className="text-white text-xl font-bold uppercase">Hermandad</p>
                <p className="text-[#BDBDBD]">Apoyo mutuo y lealtad que nos une; juntos somos más fuertes.</p>
              </div>
              <div className="flex flex-col gap-4 p-6 bg-[#222] rounded-xl">
                <span className="material-symbols-outlined text-[#D32F2F] text-4xl">verified_user</span>
                <p className="text-white text-xl font-bold uppercase">Liderazgo</p>
                <p className="text-[#BDBDBD]">Tomar las riendas de tu vida e inspirar a otros a través del ejemplo.</p>
              </div>
            </div>
          </section>

          {/* Social + Contact */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 py-10 md:py-16">
            <div className="flex flex-col gap-6">
              <h3 className="text-white text-2xl font-extrabold uppercase">Conecta con la Tribu</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <a className="flex flex-col items-center gap-2 text-center group" href="#">
                  <div className="rounded-full bg-[#222] p-4 transition-colors group-hover:bg-[#D32F2F]"><span className="material-symbols-outlined text-white text-3xl">photo_camera</span></div>
                  <p className="text-[#BDBDBD] text-sm">Instagram</p>
                </a>
                <a className="flex flex-col items-center gap-2 text-center group" href="#">
                  <div className="rounded-full bg-[#222] p-4 transition-colors group-hover:bg-[#D32F2F]"><svg className="h-[30px] w-[30px] text-white" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"></path></svg></div>
                  <p className="text-[#BDBDBD] text-sm">Twitter</p>
                </a>
                <a className="flex flex-col items-center gap-2 text-center group" href="#">
                  <div className="rounded-full bg-[#222] p-4 transition-colors group-hover:bg-[#D32F2F]"><span className="material-symbols-outlined text-white text-3xl">play_circle</span></div>
                  <p className="text-[#BDBDBD] text-sm">YouTube</p>
                </a>
                <a className="flex flex-col items-center gap-2 text-center group" href="#">
                  <div className="rounded-full bg-[#222] p-4 transition-colors group-hover:bg-[#D32F2F]"><span className="material-symbols-outlined text-white text-3xl">forum</span></div>
                  <p className="text-[#BDBDBD] text-sm">Discord</p>
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-white text-2xl font-extrabold uppercase">Comunícate con Nosotros</h3>
              <form className="flex flex-col gap-4">
                <textarea className="w-full rounded-lg bg-[#222] border-0 p-4 text-[#BDBDBD] placeholder-gray-500 focus:ring-2 focus:ring-[#D32F2F] focus:ring-inset" placeholder="Escribe tu mensaje aquí..." rows={5} />
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center self-start overflow-hidden rounded-lg h-12 px-6 bg-[#D32F2F] text-white text-base font-bold tracking-wide uppercase hover:bg-red-700 transition">Enviar Mensaje</button>
              </form>
            </div>
          </section>

          {/* CTA final */}
          <section className="py-10 md:py-16">
            <div className="bg-[#222] rounded-xl p-8 md:p-12 text-center flex flex-col items-center gap-6">
              <h2 className="text-white text-3xl font-extrabold uppercase sm:text-4xl">¿Listo para tu transformación?</h2>
              <p className="text-[#BDBDBD] text-lg max-w-2xl">Únete a la comunidad y accede a recursos, retos y apoyo continuo para forjar la mejor versión de ti.</p>
              <Link href="/herramientas" className="inline-block mt-2 rounded-lg bg-[#D32F2F] px-8 py-3 text-white font-bold uppercase hover:bg-red-600">ÚNETE A LA LEGIÓN AHORA</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
