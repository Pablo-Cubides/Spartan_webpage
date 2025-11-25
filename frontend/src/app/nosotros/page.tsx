// app/nosotros/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Nosotros - Spartan Club',
  description: 'Conoce nuestra misión, visión y el código que guía a Spartan Club.',
};

// Icon components using SVG
const FlagIcon = () => (
  <svg className="w-12 h-12 text-[#D32F2F]" fill="currentColor" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
);

const EyeIcon = () => (
  <svg className="w-12 h-12 text-[#D32F2F]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
);

const CalendarIcon = () => (
  <svg className="w-12 h-12 text-[#D32F2F]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/></svg>
);

const GroupsIcon = () => (
  <svg className="w-12 h-12 text-[#D32F2F]" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
);

const ShieldIcon = () => (
  <svg className="w-12 h-12 text-[#D32F2F]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm7 10c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V6.3l7-3.11 7 3.11V11zm-11.59.59L6 13l4 4 8-8-1.41-1.41L10 14.17z"/></svg>
);

const InstagramIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
);

const YouTubeIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>
);

const DiscordIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
);

const XIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

export default function NosotrosPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0a0a0a] text-[#D1D5DB] overflow-x-hidden">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {/* HERO */}
          <section className="py-8 md:py-16">
            <div className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:gap-12 lg:gap-16">
              <div className="md:w-1/2 flex flex-col gap-6">
                <div className="space-y-4">
                  <h1 className="text-white text-5xl font-black leading-tight uppercase tracking-tight md:text-6xl">
                    FORJANDO HOMBRES DE <span className="text-[#D32F2F]">ÉLITE</span>
                  </h1>
                  <p className="text-[#9CA3AF] text-lg md:text-xl leading-relaxed">
                    Nuestra misión es empoderarte con las herramientas para conquistar tus metas. Nuestra visión es crear una hermandad de hombres disciplinados que lideren con el ejemplo.
                  </p>
                </div>
                <Link href="/herramientas" className="inline-block w-fit group">
                  <span className="inline-flex items-center justify-center rounded-lg bg-[#D32F2F] px-8 py-4 text-white font-bold uppercase tracking-wide hover:bg-red-700 transition-all transform group-hover:scale-105 shadow-lg hover:shadow-red-900/50">
                    Únete a la Legión
                  </span>
                </Link>
              </div>
              <div className="md:w-1/2 w-full">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl aspect-square">
                  <Image
                    src="/Logo spartan club.png"
                    alt="Spartan Club"
                    fill
                    className="object-contain p-8"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Misión / Visión */}
          <section className="py-10 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group flex flex-col items-start gap-6 p-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-gray-800 hover:border-[#D32F2F]/50 transition-all hover:shadow-xl hover:shadow-[#D32F2F]/10">
                <div className="p-3 rounded-xl bg-[#D32F2F]/10 group-hover:bg-[#D32F2F]/20 transition-colors">
                  <FlagIcon />
                </div>
                <div className="space-y-3">
                  <h3 className="text-white text-3xl font-extrabold uppercase tracking-tight">Nuestra Misión</h3>
                  <p className="text-[#9CA3AF] text-base leading-relaxed">
                    Empoderar a cada hombre con las herramientas, el conocimiento y la disciplina necesarios para forjar su mejor versión y construir una vida de propósito.
                  </p>
                </div>
              </div>
              <div className="group flex flex-col items-start gap-6 p-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-gray-800 hover:border-[#D32F2F]/50 transition-all hover:shadow-xl hover:shadow-[#D32F2F]/10">
                <div className="p-3 rounded-xl bg-[#D32F2F]/10 group-hover:bg-[#D32F2F]/20 transition-colors">
                  <EyeIcon />
                </div>
                <div className="space-y-3">
                  <h3 className="text-white text-3xl font-extrabold uppercase tracking-tight">Nuestra Visión</h3>
                  <p className="text-[#9CA3AF] text-base leading-relaxed">
                    Ser la hermandad de referencia para hombres que buscan la excelencia, creando líderes que impacten positivamente en sus comunidades.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* El Código */}
          <section className="py-10 md:py-16">
            <div className="text-center mb-12">
              <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
                El <span className="text-[#D32F2F]">Código</span>
              </h2>
              <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
                Los principios fundamentales que guían nuestra hermandad
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="group flex flex-col gap-5 p-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-gray-800 hover:border-[#D32F2F]/50 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-[#D32F2F]/10">
                <div className="p-3 rounded-xl bg-[#D32F2F]/10 group-hover:bg-[#D32F2F]/20 transition-colors w-fit">
                  <CalendarIcon />
                </div>
                <div className="space-y-3">
                  <p className="text-white text-2xl font-bold uppercase tracking-tight">Disciplina</p>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    Compromiso inquebrantable con la consistencia y el autocontrol diario para forjar carácter.
                  </p>
                </div>
              </div>
              <div className="group flex flex-col gap-5 p-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-gray-800 hover:border-[#D32F2F]/50 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-[#D32F2F]/10">
                <div className="p-3 rounded-xl bg-[#D32F2F]/10 group-hover:bg-[#D32F2F]/20 transition-colors w-fit">
                  <GroupsIcon />
                </div>
                <div className="space-y-3">
                  <p className="text-white text-2xl font-bold uppercase tracking-tight">Hermandad</p>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    Apoyo mutuo y lealtad que nos une; juntos somos más fuertes que la suma de nuestras partes.
                  </p>
                </div>
              </div>
              <div className="group flex flex-col gap-5 p-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-gray-800 hover:border-[#D32F2F]/50 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-[#D32F2F]/10">
                <div className="p-3 rounded-xl bg-[#D32F2F]/10 group-hover:bg-[#D32F2F]/20 transition-colors w-fit">
                  <ShieldIcon />
                </div>
                <div className="space-y-3">
                  <p className="text-white text-2xl font-bold uppercase tracking-tight">Liderazgo</p>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    Tomar las riendas de tu vida e inspirar a otros a alcanzar su máximo potencial a través del ejemplo.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Social + Contact */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 py-10 md:py-16">
            <div className="flex flex-col gap-8">
              <div className="space-y-2">
                <h3 className="text-white text-3xl font-extrabold uppercase tracking-tight">Conecta con la Tribu</h3>
                <p className="text-[#9CA3AF]">Síguenos en nuestras redes sociales</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <a className="flex flex-col items-center gap-3 text-center group" href="#" aria-label="Instagram">
                  <div className="rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 p-5 transition-all group-hover:border-[#D32F2F] group-hover:bg-[#D32F2F]/10 group-hover:scale-110">
                    <InstagramIcon />
                  </div>
                  <p className="text-[#9CA3AF] text-sm font-medium group-hover:text-white transition-colors">Instagram</p>
                </a>
                <a className="flex flex-col items-center gap-3 text-center group" href="#" aria-label="Twitter">
                  <div className="rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 p-5 transition-all group-hover:border-[#D32F2F] group-hover:bg-[#D32F2F]/10 group-hover:scale-110">
                    <XIcon />
                  </div>
                  <p className="text-[#9CA3AF] text-sm font-medium group-hover:text-white transition-colors">Twitter</p>
                </a>
                <a className="flex flex-col items-center gap-3 text-center group" href="#" aria-label="YouTube">
                  <div className="rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 p-5 transition-all group-hover:border-[#D32F2F] group-hover:bg-[#D32F2F]/10 group-hover:scale-110">
                    <YouTubeIcon />
                  </div>
                  <p className="text-[#9CA3AF] text-sm font-medium group-hover:text-white transition-colors">YouTube</p>
                </a>
                <a className="flex flex-col items-center gap-3 text-center group" href="#" aria-label="Discord">
                  <div className="rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 p-5 transition-all group-hover:border-[#D32F2F] group-hover:bg-[#D32F2F]/10 group-hover:scale-110">
                    <DiscordIcon />
                  </div>
                  <p className="text-[#9CA3AF] text-sm font-medium group-hover:text-white transition-colors">Discord</p>
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <h3 className="text-white text-3xl font-extrabold uppercase tracking-tight">Comunícate con Nosotros</h3>
                <p className="text-[#9CA3AF]">Envíanos tu mensaje y te responderemos pronto</p>
              </div>
              <form className="flex flex-col gap-5" action="/api/contact" method="POST">
                <textarea
                  name="message"
                  className="w-full rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 p-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent transition-all resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                  rows={6}
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center self-start rounded-xl px-8 py-4 bg-[#D32F2F] text-white font-bold uppercase tracking-wide hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-red-900/50"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </section>

          {/* CTA final */}
          <section className="py-10 md:py-16">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-10 md:p-16 text-center border border-gray-800 shadow-2xl">
              <div className="absolute inset-0 bg-[url('/Hero.png')] bg-cover bg-center opacity-5" />
              <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="space-y-4 max-w-3xl">
                  <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tight">
                    ¿Listo para tu <span className="text-[#D32F2F]">Transformación</span>?
                  </h2>
                  <p className="text-[#9CA3AF] text-xl leading-relaxed">
                    Únete a una comunidad de hombres que no se conforman. Es hora de forjar la mejor versión de ti mismo.
                  </p>
                </div>
                <Link href="/herramientas" className="group">
                  <span className="inline-flex items-center justify-center rounded-xl bg-[#D32F2F] px-10 py-5 text-white text-lg font-bold uppercase tracking-wide hover:bg-red-600 transition-all transform group-hover:scale-105 shadow-2xl hover:shadow-red-900/50">
                    ÚNETE A LA LEGIÓN AHORA
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
