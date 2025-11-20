// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#303030] mt-8 bg-[#141414]">
      <div className="grid grid-cols-1 gap-8 px-6 py-12 mx-auto text-white max-w-7xl md:grid-cols-4">
        {/* Logo y Marca */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="size-6">
              <svg viewBox="0 0 48 48" fill="none" width={32} height={32} xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_319)">
                  <path
                    d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6_319">
                    <rect width="48" height="48" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-wide">Spartan Edge</span>
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
          <span>&copy; {new Date().getFullYear()} Spartan Edge — Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/terminos-y-condiciones" className="hover:text-[#C62828] transition">Términos y Condiciones</Link>
            <Link href="/politica-de-privacidad" className="hover:text-[#C62828] transition">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

