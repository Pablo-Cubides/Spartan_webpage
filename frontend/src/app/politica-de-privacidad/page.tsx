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
    <div className="px-6 py-12 mx-auto max-w-4xl text-white">
      <h1 className="text-3xl font-bold mb-4 text-[#C62828]">
        Política de Privacidad — Triarvon
      </h1>
      <p className="text-base text-gray-200 leading-relaxed mb-6">
        En Triarvon protegemos tu privacidad y la seguridad de tus datos
        personales. Esta política detalla la información que recopilamos, cómo
        la utilizamos para brindarte nuestros servicios y tus derechos de
        acceso, rectificación y eliminación.
      </p>
      <div className="space-y-6 text-gray-300">
        <p className="text-sm text-gray-400">
          Última actualización: 28/Jul/2026
        </p>
        <p>
          <strong className="text-white">Responsable:</strong> Andrés Guerrero —{" "}
          <strong className="text-white">Contacto:</strong>{" "}
          triarvonmarket@gmail.com
        </p>

        <div className="bg-[#181a1d] p-6 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-4">
            Resumen de Privacidad
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-200">
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
    </div>
  );
}
