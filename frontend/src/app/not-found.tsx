import Link from 'next/link';

// A simple inline SVG for a Spartan helmet icon
const SpartanHelmetIcon = () => (
  <svg className="w-24 h-24 text-[#a2aab3] mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L8 6v3h8V6L12 2z" />
    <path d="M18 9H6v7c0 4 6 5 6 5s6-1 6-5V9z" />
    <path d="M14 13h-4" />
  </svg>
);

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121416] text-white text-center px-4">
      <SpartanHelmetIcon />
      <h1 className="mt-8 text-6xl font-black text-[#C62828] tracking-widest">404</h1>
      <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Has Perdido el Camino, Guerrero.
      </h2>
      <p className="mt-4 max-w-md text-[#a2aab3]">
        El sendero que buscas no se encuentra en este reino. Regresa al campamento y reagrúpate.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-[#C62828] px-8 py-3 font-bold text-white text-base hover:bg-[#a21d1d] transition-colors"
      >
        Volver al Inicio
      </Link>
    </div>
  );
}