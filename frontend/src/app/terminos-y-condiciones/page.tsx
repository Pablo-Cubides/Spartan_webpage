import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Triarvon",
  description:
    "Términos y condiciones de uso de la plataforma Triarvon. Consulta los derechos, obligaciones, políticas de créditos y normas de uso aplicables.",
  alternates: {
    canonical: `${BASE_URL}/terminos-y-condiciones`,
  },
};

export default function TerminosPage() {
  return (
    <div className="px-6 py-12 mx-auto max-w-4xl text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#C62828]">
        Términos y Condiciones de Uso — Triarvon
      </h1>
      <p className="text-base text-gray-200 leading-relaxed mb-6">
        El presente acuerdo establece las condiciones legales, derechos,
        obligaciones y directrices operativas que rigen el acceso, navegación y
        uso del sitio web Triarvon (triarvon.com), así como de nuestras
        herramientas digitales, módulos de asesoría asistida por inteligencia
        artificial y contenidos editoriales. Al acceder o utilizar cualquier
        sección de la plataforma, declaras haber leído, entendido y aceptado
        plenamente estos Términos y Condiciones.
      </p>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-400">
          Última actualización: Septiembre de 2026 • Versión 2.1
        </p>
        <p>
          <strong className="text-white">Titular de la Plataforma:</strong>{" "}
          Andrés Guerrero / Triarvon •{" "}
          <strong className="text-white">Contacto Legal y Soporte:</strong>{" "}
          triarvonmarket@gmail.com
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          1. Objeto y naturaleza de los servicios
        </h2>
        <p>
          Triarvon es una plataforma digital orientada al desarrollo personal,
          la optimización física, el estilo y la disciplina masculina. La
          plataforma proporciona acceso a artículos formativos, herramientas
          interactivas de visión artificial (como el Asesor de Forma de Rostro y
          el Asesor de Estilo) y sistemas de conversación orientativa basados en
          inteligencia artificial (Coach Triarvon).
        </p>
        <p className="bg-[#181a1d] p-4 rounded-lg border border-gray-800 text-sm text-gray-200">
          <strong className="text-white">Aviso de Exención Profesional:</strong>{" "}
          Las recomendaciones generadas por las herramientas de inteligencia
          artificial y los artículos publicados tienen una finalidad
          estrictamente educativa y motivacional. Ningún análisis, cálculo
          biométrico ni respuesta generada por los modelos de IA constituye
          diagnóstico clínico, prescripción médica, tratamiento nutricional
          personalizado ni asesoramiento legal o financiero profesional. Te
          aconsejamos consultar a especialistas certificados antes de comenzar
          rutinas exigentes de ejercicio o modificaciones extremas en tu dieta o
          estilo de vida.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          2. Registro, cuentas y seguridad de credenciales
        </h2>
        <p>
          Para acceder a ciertas funciones interactivas y almacenar tu historial
          de uso, se requiere la creación de una cuenta de usuario con una
          dirección de correo electrónico válida y una contraseña segura. Eres
          el único responsable de:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm pl-4">
          <li>
            Preservar la confidencialidad de tus credenciales de acceso y no
            compartirlas con terceros.
          </li>
          <li>
            Todas las operaciones, consultas y consumos de créditos realizados
            desde tu cuenta autenticada.
          </li>
          <li>
            Notificar inmediatamente al equipo de soporte ante cualquier
            sospecha de acceso no autorizado o vulneración de seguridad.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">
          3. Sistema de créditos, pagos y política de reembolsos
        </h2>
        <p>
          El uso intensivo de las herramientas de inteligencia artificial y
          generación de recomendaciones avanzadas se gestiona mediante un
          sistema de créditos virtuales:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm pl-4">
          <li>
            <strong>Consumo de créditos:</strong> Cada análisis facial o
            consulta de procesamiento con IA deduce la cantidad de créditos
            indicada en la interfaz antes de ejecutar la acción.
          </li>
          <li>
            <strong>Procesamiento de pagos:</strong> Los paquetes de créditos se
            comercializan a través de pasarelas de pago seguras y reconocidas
            internacionalmente (Stripe y MercadoPago), las cuales garantizan el
            cifrado de extremo a extremo de las transacciones.
          </li>
          <li>
            <strong>Condición no reembolsable:</strong> Debido a que el
            procesamiento de inferencia de IA consume recursos computacionales
            inmediatos e irreversibles, los créditos adquiridos que ya hayan
            sido utilizados o activados no son sujetos a reembolso, salvo fallas
            técnicas comprobadas atribuibles exclusivamente a nuestros
            servidores.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">
          4. Normas de conducta y uso aceptable
        </h2>
        <p>
          Como usuario de Triarvon, te comprometes a utilizar la plataforma
          conforme a la ley, la moral y las buenas costumbres. Queda
          expresamente prohibido:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm pl-4">
          <li>
            Cargar o transmitir imágenes, contenidos o textos que vulneren
            derechos de autor, privacidad de terceros o contengan material
            ilícito, difamatorio u ofensivo.
          </li>
          <li>
            Intentar descompilar, realizar ingeniería inversa o eludir los
            mecanismos de autenticación y límites de uso del sistema.
          </li>
          <li>
            Emplear herramientas automatizadas (bots, scrapers o crawlers no
            autorizados) para extraer masivamente datos o sobrecargar la
            infraestructura del servidor.
          </li>
          <li>
            Utilizar las herramientas de IA para fines fraudulentos, de
            suplantación de identidad o engaño a terceros.
          </li>
        </ul>
        <p>
          Nos reservamos la facultad de suspender temporalmente o cancelar de
          manera definitiva las cuentas que infrinjan estas directrices, sin
          derecho a indemnización ni restitución de créditos pendientes.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          5. Propiedad intelectual e industrial
        </h2>
        <p>
          Todos los elementos gráficos, códigos de programación, arquitecturas
          de software, logotipos, marcas comerciales (&ldquo;Triarvon&rdquo;),
          textos, audios y diseños visuales alojados en este portal son de
          propiedad exclusiva de su titular o cuentan con las licencias
          correspondientes. Queda prohibida la reproducción, distribución,
          transformación o comunicación pública de dichos contenidos sin la
          previa autorización por escrito de Triarvon.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          6. Limitación de responsabilidad y disponibilidad
        </h2>
        <p>
          Aunque nos esforzamos por mantener una disponibilidad ininterrumpida y
          la máxima precisión en los servicios, no garantizamos que el sitio web
          funcione libre de errores imprevistos, interrupciones por
          mantenimiento de servidores o demoras en la red de telecomunicaciones.
          Triarvon no asume responsabilidad alguna por daños indirectos, pérdida
          de oportunidades de negocio o decisiones tomadas por los usuarios a
          partir de las sugerencias automatizadas de las herramientas.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          7. Modificaciones a los términos y legislación aplicable
        </h2>
        <p>
          Triarvon se reserva el derecho de actualizar o modificar estos
          Términos y Condiciones en cualquier momento para adaptarlos a mejoras
          operativas, nuevas funcionalidades o cambios regulatorios. Las
          modificaciones entrarán en vigencia a partir de su publicación en esta
          misma página web. Estos términos se rigen e interpretan de conformidad
          con la legislación aplicable en la jurisdicción del titular.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          8. Canales de soporte y resolución de controversias
        </h2>
        <p>
          Para formular cualquier duda, reclamo o solicitud relacionada con
          estos Términos y Condiciones de Uso, puedes ponerte en contacto con
          nuestro equipo directivo en el correo electrónico:{" "}
          <strong className="text-white">triarvonmarket@gmail.com</strong>.
        </p>
      </div>
    </div>
  );
}
