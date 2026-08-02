/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

export const metadata: Metadata = {
  title: "Política de Privacidad | Triarvon",
  description:
    "Política de privacidad de Triarvon. Conoce cómo protegemos tus datos y tu privacidad.",
  alternates: {
    canonical: `${BASE_URL}/politica-de-privacidad`,
  },
};

export default function PrivacidadPage() {
  return (
    <main className="px-6 py-12 mx-auto max-w-4xl text-white">
      <h1 className="text-3xl font-bold mb-6 text-[#C62828]">
        Política de Privacidad — Triarvon
      </h1>
      <div className="space-y-6 text-[#a2aab3]">
        <p className="text-sm">Última actualización: 28/Jul/2026</p>
        <p>
          <strong className="text-white">Responsable:</strong> Andrés Guerrero —{" "}
          <strong className="text-white">Contacto:</strong>{" "}
          triarvonmarket@gmail.com
        </p>

        <div className="bg-[#181a1d] p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            Resumen de Privacidad
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-white">Datos recopilados:</strong> Correo
              electrónico, alias, nombre (si te registras); datos técnicos de
              navegación (IP/UA).
            </li>
            <li>
              <strong className="text-white">Finalidad:</strong> Gestionar tu
              cuenta, proporcionarte acceso a las herramientas de IA (Coach
              Triarvon) y enviar novedades.
            </li>
            <li>
              <strong className="text-white">Proveedores:</strong> Vercel,
              Firebase (Google), Brevo y herramientas analíticas.
            </li>
            <li>
              <strong className="text-white">Tus derechos:</strong> Acceso,
              rectificación y eliminación enviando un correo a
              triarvonmarket@gmail.com.
            </li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-white pt-4">
          1. Datos que procesamos
        </h2>
        <p>
          Procesamos tus datos de cuenta para gestionar el acceso a los
          servicios de Triarvon. No almacenamos datos bancarios directos.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          2. Menores de edad
        </h2>
        <p>Triarvon está reservado exclusivamente para mayores de 18 años.</p>

        <h2 className="text-2xl font-bold text-white pt-4">3. Contacto</h2>
        <p>
          Para solicitudes de privacidad o eliminación de datos:
          triarvonmarket@gmail.com
        </p>
      </div>
    </main>
  );
}
