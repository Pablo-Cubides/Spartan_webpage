import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

export const metadata: Metadata = {
  title: "Política de Privacidad | Triarvon",
  description:
    "Política de privacidad integral de Triarvon. Conoce cómo gestionamos, protegemos y resguardamos tus datos personales y tus derechos de privacidad.",
  alternates: {
    canonical: `${BASE_URL}/politica-de-privacidad`,
  },
};

export default function PrivacidadPage() {
  return (
    <div className="px-6 py-12 mx-auto max-w-4xl text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#C62828]">
        Política de Privacidad — Triarvon
      </h1>
      <p className="text-base text-gray-200 leading-relaxed mb-6">
        En Triarvon estamos plenamente comprometidos con la protección de tu
        privacidad, la seguridad de tu información personal y el cumplimiento de
        las normativas internacionales de protección de datos (incluyendo el
        RGPD europeo y las leyes de Habeas Data latinoamericanas). Esta política
        explica de forma transparente cómo recopilamos, tratamos, almacenamos y
        salvaguardamos tu información al interactuar con nuestra plataforma,
        herramientas y servicios.
      </p>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-400">
          Última actualización: Septiembre de 2026 • Versión 2.1
        </p>
        <p>
          <strong className="text-white">Responsable del Tratamiento:</strong>{" "}
          Andrés Guerrero / Triarvon •{" "}
          <strong className="text-white">Correo Oficial de Privacidad:</strong>{" "}
          triarvonmarket@gmail.com
        </p>

        <div className="bg-[#181a1d] p-6 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-4">
            Resumen de Compromisos Clave de Privacidad
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-200 text-sm">
            <li>
              <strong className="text-white">Datos de Registro:</strong> Correo
              electrónico, alias y nombre público para la administración de tu
              cuenta y la asignación de créditos.
            </li>
            <li>
              <strong className="text-white">Uso de Herramientas de IA:</strong>{" "}
              Las fotos y consultas enviadas a los asesores de rostro, estilo y
              coaches se procesan de forma efímera para generar las
              recomendaciones y no se venden ni comparten con terceros.
            </li>
            <li>
              <strong className="text-white">Pagos y Transacciones:</strong> No
              almacenamos números de tarjetas de crédito ni credenciales
              bancarias en nuestros servidores; todos los cobros se gestionan
              mediante pasarelas cifradas certificadas (Stripe y MercadoPago).
            </li>
            <li>
              <strong className="text-white">Derechos del Usuario:</strong>{" "}
              Puedes solicitar en cualquier momento la exportación,
              rectificación o eliminación total y definitiva de tu cuenta y
              registros asociados.
            </li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-white pt-4">
          1. Información que recopilamos y procesamos
        </h2>
        <p>
          Recopilamos únicamente la información indispensable para brindarte una
          experiencia funcional y personalizada:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm pl-4">
          <li>
            <strong>Datos proporcionados directamente:</strong> Dirección de
            correo electrónico, contraseña cifrada mediante hash criptográfico
            (bcrypt/argon2), nombre de usuario y preferencias declaradas en los
            módulos de personalización.
          </li>
          <li>
            <strong>Imágenes y archivos de consulta:</strong> Fotografías
            cargadas voluntariamente para el Asesor de Forma de Rostro o el
            Asesor de Estilo, procesadas exclusivamente para la inferencia
            visual y sujetas a purga periódica.
          </li>
          <li>
            <strong>Registros de interacción técnica:</strong> Dirección IP
            anonimizada, tipo de navegador, sistema operativo, resolución de
            pantalla y páginas visitadas para fines de diagnóstico, seguridad
            contra ataques DDoS y optimización de rendimiento.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">
          2. Finalidad y base jurídica del tratamiento
        </h2>
        <p>
          El tratamiento de tus datos responde a las siguientes finalidades
          legítimas:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm pl-4">
          <li>
            <strong>Ejecución del servicio:</strong> Permitir el inicio de
            sesión, el balance de créditos y la entrega de respuestas en los
            chats de mentoría y herramientas de visión artificial.
          </li>
          <li>
            <strong>Comunicaciones operativas:</strong> Envío de confirmaciones
            de compra, restablecimiento de accesos y avisos relevantes de
            seguridad del sistema.
          </li>
          <li>
            <strong>Consentimiento para boletines:</strong> Si te suscribes
            expresamente a nuestro boletín informativo, recibirás artículos
            editoriales y novedades, pudiendo revocar tu consentimiento con un
            solo clic en cualquier momento.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">
          3. Seguridad, almacenamiento y retención de datos
        </h2>
        <p>
          Implementamos protocolos de seguridad estándar de la industria,
          incluyendo transmisión de datos mediante HTTPS con cifrado TLS 1.3,
          bases de datos aisladas con autenticación reforzada y controles de
          acceso estrictos bajo el principio de menor privilegio. Conservamos tu
          información mientras mantengas activa tu cuenta; tras una solicitud de
          baja voluntaria, tus datos son eliminados o anonimizados
          irreversiblemente en un plazo máximo de 30 días hábiles.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          4. Proveedores tecnológicos de confianza
        </h2>
        <p>
          Para garantizar la disponibilidad global y la alta velocidad de la
          plataforma, colaboramos con proveedores líderes que cumplen con
          elevados estándares de protección de datos:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm pl-4">
          <li>
            <strong>Infraestructura y Alojamiento:</strong> Vercel Inc. (red de
            distribución de contenidos CDN y cómputo edge).
          </li>
          <li>
            <strong>Base de Datos y Autenticación:</strong> Supabase Inc. /
            Firebase (Google LLC), con centros de datos auditados bajo
            certificaciones SOC2 y normativas ISO 27001.
          </li>
          <li>
            <strong>Comunicaciones por Correo:</strong> Brevo / Sendinblue para
            la entrega confiable de correos transaccionales y notificaciones.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">
          5. Política de cookies y tecnologías similares
        </h2>
        <p>
          Utilizamos cookies esenciales para mantener tu sesión autenticada de
          manera segura y cookies analíticas para comprender el flujo de
          navegación general de los usuarios. No empleamos cookies invasivas de
          rastreo publicitario entre sitios de terceros ni comercializamos
          perfiles de navegación. Puedes configurar o desactivar las cookies
          analíticas desde las opciones de tu navegador o nuestro panel de
          consentimiento.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          6. Derechos del usuario (ARCO y RGPD)
        </h2>
        <p>
          Tienes pleno derecho a ejercer en cualquier momento tus facultades de:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm pl-4">
          <li>
            <strong>Acceso:</strong> Solicitar copia de los datos personales
            almacenados en tu cuenta.
          </li>
          <li>
            <strong>Rectificación:</strong> Corregir información incompleta,
            inexacta o desactualizada.
          </li>
          <li>
            <strong>Cancelación / Supresión:</strong> Exigir el borrado
            definitivo de tu perfil y registros vinculados.
          </li>
          <li>
            <strong>Oposición y Limitación:</strong> Oponerte al tratamiento de
            datos con fines promocionales o limitar su alcance.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">
          7. Protección de menores de edad
        </h2>
        <p>
          Nuestros servicios y herramientas están dirigidos exclusivamente a
          personas mayores de 18 años. No recopilamos deliberadamente
          información perteneciente a menores de edad. En caso de detectar
          registros de menores sin consentimiento parental demostrable,
          procederemos de inmediato a su cancelación y eliminación permanente de
          nuestros sistemas.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          8. Canales de contacto y resolución de inquietudes
        </h2>
        <p>
          Para cualquier consulta, aclaración o solicitud relacionada con esta
          Política de Privacidad o el tratamiento de tus datos personales,
          puedes escribirnos directamente a:{" "}
          <strong className="text-white">triarvonmarket@gmail.com</strong>.
          Responderemos a tu solicitud con la mayor diligencia dentro de los
          plazos establecidos por la legislación aplicable.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">
          9. Marco Legal y Referencias Regulatorias de Autoridad
        </h2>
        <p className="text-sm">
          Triarvon fundamenta sus protocolos de privacidad en los estándares
          internacionales más rigurosos de soberanía y protección de datos
          digitales:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm pl-4 text-gray-300">
          <li>
            <strong className="text-white">
              Reglamento General de Protección de Datos (RGPD / GDPR):
            </strong>{" "}
            Consulta el marco normativo comunitario en el{" "}
            <a
              href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              Diario Oficial de la Unión Europea (EUR-Lex)
            </a>{" "}
            y su análisis en la{" "}
            <a
              href="https://es.wikipedia.org/wiki/Reglamento_General_de_Protecci%C3%B3n_de_Datos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              Enciclopedia Wikipedia: RGPD
            </a>
            .
          </li>
          <li>
            <strong className="text-white">
              Régimen de Protección de Datos Personales (Habeas Data):
            </strong>{" "}
            Directrices de la Superintendencia de Industria y Comercio en{" "}
            <a
              href="https://www.sic.gov.co/proteccion-de-datos-personales"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              Portal Oficial SIC (.gov.co)
            </a>
            .
          </li>
        </ul>
      </div>
    </div>
  );
}
