// components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-[#303030] mt-8 bg-[#000000]">
      <div className="grid grid-cols-1 gap-8 px-6 py-12 mx-auto text-white max-w-7xl md:grid-cols-4">
        {/* Logo */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Image
                width={160}
                height={160}
                src="/Logo spartan club - sin fondo.png"
                alt="Spartan Club"
                className="object-contain"
              />
            </div>
          </div>
          <p className="text-[#ababab] text-sm mt-2">
            Forjando hombres, moldeando destinos.<br />
            Disciplina. Coraje. Hermandad.
          </p>
        </div>
        {/* Links rápidos */}
        <div>
          <h3 className="uppercase text-[#C62828] text-xs font-bold mb-3 tracking-widest">Navegación</h3>
          <ul className="flex flex-col gap-2">
            <li><Link href="/blog" className="hover:text-[#C62828] transition text-sm">Blog</Link></li>
            <li><Link href="/herramientas" className="hover:text-[#C62828] transition text-sm">Herramientas</Link></li>
            <li><Link href="/nosotros" className="hover:text-[#C62828] transition text-sm">Sobre Nosotros</Link></li>
          </ul>
        </div>
        {/* Newsletter */}
        <div>
          <h3 className="uppercase text-[#C62828] text-xs font-bold mb-3 tracking-widest">Newsletter</h3>
          <p className="text-[#ababab] text-sm mb-3">Recibe tips de disciplina, masculinidad y automejora en tu correo.</p>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              className="rounded-lg bg-[#222] border border-[#303030] px-3 py-2 text-sm text-white placeholder-[#888] focus:outline-none"
              placeholder="Tu email"
              autoComplete="email"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#C62828] px-3 py-2 font-bold text-white text-sm hover:bg-[#a21d1d] transition"
            >
              Suscribirse
            </button>
          </form>
        </div>
        {/* Redes sociales */}
        <div>
          <h3 className="uppercase text-[#C62828] text-xs font-bold mb-3 tracking-widest">Síguenos</h3>
          <div className="flex gap-4 mt-1">
            <a href="#" aria-label="X" className="hover:text-[#C62828] transition">
              {/* X */}
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.53 6.47a.75.75 0 0 1 0 1.06L7.53 17.53a.75.75 0 1 1-1.06-1.06l10-10a.75.75 0 0 1 1.06 0z" />
                <path fill="currentColor" d="M6.47 6.47a.75.75 0 0 1 1.06 0l10 10a.75.75 0 1 1-1.06 1.06l-10-10a.75.75 0 0 1 0-1.06z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-[#C62828] transition">
              {/* Instagram */}
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="7" r="1" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-[#C62828] transition">
              {/* YouTube */}
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24">
                <rect x="3" y="6" width="18" height="12" rx="4" stroke="currentColor" strokeWidth="2" />
                <polygon points="10,9 16,12 10,15" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#303030] py-4 text-center text-[#ababab] text-xs bg-[#141414]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Spartan Club — Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/terminos-y-condiciones" className="hover:text-[#C62828] transition">Términos y Condiciones</Link>
            <Link href="/politica-de-privacidad" className="hover:text-[#C62828] transition">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

