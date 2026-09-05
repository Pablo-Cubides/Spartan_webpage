"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <aside
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-gray-800 p-4 shadow-lg animate-fade-in-up"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-gray-300 text-sm">
            Utilizamos cookies para mejorar tu experiencia y analizar el uso de
            nuestra plataforma. Al continuar navegando, aceptas nuestra{" "}
            <a
              href="/politica-de-privacidad"
              className="text-red-400 hover:underline font-medium"
            >
              Política de Privacidad
            </a>{" "}
            y el uso de cookies.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleAccept}
            className="bg-[#D32F2F] hover:bg-[#b71c1c] text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors duration-200 shadow-md hover:shadow-red-900/20"
          >
            Aceptar
          </button>
        </div>
      </div>
    </aside>
  );
}
