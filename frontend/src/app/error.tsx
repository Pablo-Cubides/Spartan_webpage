'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// A simple inline SVG for a broken shield icon
const BrokenShieldIcon = () => (
    <svg className="w-20 h-20 text-[#C62828] mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 6v5.5C4 17.5 12 22 12 22s8-4.5 8-10.5V6L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 10.5L14.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 10L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);


export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121416] text-white text-center px-4">
      <BrokenShieldIcon />
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        Un Obstáculo en el Camino.
      </h1>
      <p className="mt-4 max-w-md text-[#a2aab3]">
        La batalla se detuvo inesperadamente. Puedes intentar reagruparte o volver al inicio. El error ha sido reportado.
      </p>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left w-full max-w-md">
          <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
            Detalles del error (desarrollo)
          </summary>
          <pre className="mt-2 text-xs bg-gray-900 p-3 rounded text-red-400 overflow-auto max-h-48">
            {error.message}\n{error.stack}
          </pre>
        </details>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto inline-block rounded-lg bg-[#C62828] px-8 py-3 font-bold text-white text-base hover:bg-[#a21d1d] transition-colors"
        >
          Intentar de Nuevo
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto inline-block rounded-lg bg-gray-700 px-8 py-3 font-bold text-white text-base hover:bg-gray-600 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-gray-500">
          Código de error: {error.digest}
        </p>
      )}
    </div>
  );
}
