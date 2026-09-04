// components/Footer.tsx
import Link from "next/link";
import Image from "next/image";

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
                src="/Triarvon/triarvon-logo-transparent.png"
                alt="Logo Triarvon - Alto Rendimiento Masculino"
                className="object-contain"
              />
            </div>
          </div>
          <p className="text-gray-200 text-sm mt-2">
            Forjando hombres, moldeando destinos.
            <br />
            Disciplina. Coraje. Excelencia.
          </p>
        </div>
        {/* Links rápidos */}
        <div>
          <h2 className="uppercase text-red-500 text-xs font-bold mb-3 tracking-widest">
            Navegación
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href="/blog"
                className="text-gray-200 hover:text-white transition text-sm"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/herramientas"
                className="text-gray-200 hover:text-white transition text-sm"
              >
                Herramientas
              </Link>
            </li>
            <li>
              <Link
                href="/nosotros"
                className="text-gray-200 hover:text-white transition text-sm"
              >
                Nosotros
              </Link>
            </li>
          </ul>
        </div>
        {/* Newsletter */}
        <div>
          <h2 className="uppercase text-red-500 text-xs font-bold mb-3 tracking-widest">
            Boletín Informativo
          </h2>
          <p className="text-gray-200 text-sm mb-3">
            Recibe consejos sobre disciplina, masculinidad y mejora personal en
            tu email.
          </p>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              className="rounded-lg bg-[#1a1a1a] border border-gray-600 px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none focus:border-red-500"
              placeholder="Tu correo"
              autoComplete="email"
              aria-label="Correo electrónico para boletín"
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
          <h2 className="uppercase text-red-500 text-xs font-bold mb-3 tracking-widest">
            Síguenos
          </h2>
          <div className="flex gap-4 mt-1">
            <a
              href="https://x.com/triarvon_club"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en X (Twitter)"
              className="text-gray-300 hover:text-white transition"
            >
              {/* X */}
              <svg
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M17.53 6.47a.75.75 0 0 1 0 1.06L7.53 17.53a.75.75 0 1 1-1.06-1.06l10-10a.75.75 0 0 1 1.06 0z"
                />
                <path
                  fill="currentColor"
                  d="M6.47 6.47a.75.75 0 0 1 1.06 0l10 10a.75.75 0 1 1-1.06 1.06l-10-10a.75.75 0 0 1 0-1.06"
                />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/triarvon_club/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en Instagram"
              className="text-gray-300 hover:text-white transition"
            >
              {/* Instagram */}
              <svg
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="17" cy="7" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61569420803657"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en Facebook"
              className="text-gray-300 hover:text-white transition"
            >
              {/* Facebook */}
              <svg
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.52-.14-2.774-.14-2.826 0-4.726 1.72-4.726 4.86v2.64H7v4h3v9.5h4v-9.5z"
                />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@triarvon_club"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en TikTok"
              className="text-gray-300 hover:text-white transition"
            >
              {/* TikTok */}
              <svg
                width={24}
                height={24}
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.126V9.41a6.34 6.34 0 0 0-.87-.06A6.33 6.33 0 0 0 3.12 15.68a6.34 6.34 0 0 0 6.34 6.32 6.34 6.34 0 0 0 6.33-6.32V8.92a8.28 8.28 0 0 0 4.8-1.51v-3.4a4.84 4.84 0 0 1-1 .28z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#303030] py-4 text-center text-gray-300 text-xs bg-[#141414]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            &copy; {new Date().getFullYear()} Triarvon — Todos los derechos
            reservados.
          </span>
          <div className="flex gap-4">
            <Link
              href="/terminos-y-condiciones"
              className="text-gray-300 hover:text-white transition"
            >
              Términos y Condiciones
            </Link>
            <Link
              href="/politica-de-privacidad"
              className="text-gray-300 hover:text-white transition"
            >
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
