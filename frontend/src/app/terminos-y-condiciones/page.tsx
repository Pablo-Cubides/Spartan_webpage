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
    <div className="px-6 py-12 mx-auto max-w-4xl text-white">
      <h1 className="text-3xl font-bold mb-4 text-[#C62828]">
        Términos y Condiciones — Triarvon
      </h1>
      <p className="text-base text-gray-200 leading-relaxed mb-6">
        Este documento establece los términos y condiciones de uso para la
        plataforma Triarvon, nuestras herramientas de inteligencia artificial y
        los servicios de desarrollo personal y coaching para hombres.
      </p>
      <div className="space-y-6 text-gray-300">
        <p className="text-sm text-gray-400">
          Última actualización: 28/Jul/2026
        </p>
        <p>
          <strong className="text-white">Titular/Responsable:</strong> Andrés
          Guerrero
        </p>
        <p>
          <strong className="text-white">Contacto:</strong>{" "}
          triarvonmarket@gmail.com
        </p>
        <p>
          Bienvenido a Triarvon. Al acceder o utilizar nuestra plataforma web y
          nuestras herramientas de análisis de estilo y coaching asistido por
          IA, aceptas estos Términos y Condiciones. Si no estás de acuerdo, por
          favor no utilices el servicio.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          1. Descripción del servicio
        </h2>
        <p>
          Triarvon ofrece una plataforma de desarrollo personal masculino que
          incluye artículos de blog, un Asesor de Estilo con IA y el servicio de
          Coach Triarvon (chat asistido por inteligencia artificial). Las
          respuestas generadas por IA son orientativas y no reemplazan el
          consejo médico, nutricional, psicológico ni legal profesional.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          2. Cuentas y registro
        </h2>
        <p>
          Para acceder a ciertas funciones debes registrarte con un correo
          válido. Eres responsable de mantener la confidencialidad de tus
          credenciales y de cualquier actividad en tu cuenta.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          3. Sistema de créditos y pagos
        </h2>
        <p>
          Ciertas funciones de IA consumen créditos. Los créditos adquiridos no
          son reembolsables una vez utilizados. Los pagos se procesan de forma
          segura mediante pasarelas autorizadas (MercadoPago y Stripe).
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">4. Uso aceptable</h2>
        <p>
          Te comprometes a no usar la plataforma con fines ilegales, abusivos,
          que infrinjan derechos de terceros o que busquen eludir las medidas de
          seguridad del sistema. Nos reservamos el derecho de suspender cuentas
          que violen estas normas.
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
          soporte: triarvonmarket@gmail.com
        </p>
      </div>
    </div>
  );
}
