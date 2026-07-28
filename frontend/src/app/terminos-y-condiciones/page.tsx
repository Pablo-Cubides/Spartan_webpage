import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Triarvon",
  description:
    "Términos y condiciones de uso de Triarvon. Acepta nuestros términos antes de usar el sitio.",
  alternates: {
    canonical: `${BASE_URL}/terminos-y-condiciones`,
  },
};

export default function TerminosPage() {
  return (
    <main className="px-6 py-12 mx-auto max-w-4xl text-white">
      <h1 className="text-3xl font-bold mb-6 text-[#C62828]">
        Términos y Condiciones — Triarvon
      </h1>
      <div className="space-y-6 text-[#a2aab3]">
        <p className="text-sm">Última actualización: 28/Jul/2026</p>
        <p>
          <strong className="text-white">Titular/Responsable:</strong> Andrés
          Guerrero
        </p>
        <p>
          <strong className="text-white">Contacto:</strong>{" "}
          spartanmarket@gmail.com
        </p>
        <p>
          <strong className="text-white">Sitio:</strong> “Triarvon” (asesoría,
          guías, herramientas de IA, boletín y desarrollo de alto rendimiento
          masculino).
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          1. Aceptación y alcance
        </h2>
        <p>
          Al utilizar Triarvon aceptas estos Términos y Condiciones. Si no estás
          de acuerdo, por favor no utilices el sitio.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          2. Elegibilidad (18+)
        </h2>
        <p>
          Triarvon está destinado a mayores de 18 años. El contenido es
          educativo e informativo y no sustituye la asesoría médica,
          psicológica, nutricional o legal.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          3. Servicios ofrecidos
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Contenido editorial: guías, artículos y recomendaciones de alto
            rendimiento.
          </li>
          <li>
            Herramientas interactivas con inteligencia artificial (Coach
            Triarvon, Asesor de Estilo).
          </li>
          <li>Boletín informativo.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">
          4. Cuentas y perfiles
        </h2>
        <p>
          Puedes crear un perfil mediante correo electrónico o Google Firebase.
          Eres responsable de mantener la seguridad de tu cuenta.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          5. Propiedad intelectual
        </h2>
        <p>
          El contenido, diseño y marcas registradas de Triarvon pertenecen a su
          titular. Queda prohibida la reproducción o reventa no autorizada.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          6. Ley aplicable y contacto
        </h2>
        <p>
          Estos Términos se rigen por la legislación vigente. Para dudas o
          soporte: spartanmarket@gmail.com
        </p>
      </div>
    </main>
  );
}
