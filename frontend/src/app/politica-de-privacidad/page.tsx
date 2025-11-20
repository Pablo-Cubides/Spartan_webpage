
export default function PrivacidadPage() {
  return (
    <main className="px-6 py-12 mx-auto max-w-4xl text-white">
      <h1 className="text-3xl font-bold mb-6 text-[#C62828]">Política de Privacidad — Spartan Club</h1>
      <div className="space-y-6 text-[#a2aab3]">
        <p className="text-sm">Última actualización: 18/nov/2025</p>
        <p><strong className="text-white">Responsable:</strong> Andrés Guerrero — <strong className="text-white">Contacto:</strong> spartanmarket@gmail.com</p>

        <div className="bg-[#181a1d] p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Resumen rápido (capa corta)</h2>
            <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">Qué recolectamos:</strong> email, alias, nombre, edad (si hay registro); datos técnicos básicos (p. ej., IP/UA) para seguridad; preferencias (newsletter).</li>
                <li><strong className="text-white">Para qué:</strong> crear/gestionar tu cuenta, enviar comunicaciones solicitadas, mejorar contenidos, proteger el sitio.</li>
                <li><strong className="text-white">Con quién:</strong> proveedores tecnológicos (p. ej., Vercel, Firebase, Brevo y herramientas de analítica/marketing que podamos integrar).</li>
                <li><strong className="text-white">Pagos:</strong> si compras en apps de terceros, el procesamiento lo hace ese tercero (no almacenamos tus datos de tarjeta).</li>
                <li><strong className="text-white">Tus derechos:</strong> acceder, actualizar, eliminar y oponerte a ciertos tratamientos.</li>
                <li><strong className="text-white">Retención:</strong> si pides eliminar tu cuenta, la suprimimos en ≤30 días (copias de seguridad pueden tardar algo más en rotarse).</li>
                <li><strong className="text-white">Menores:</strong> sitio 18+. Si detectamos una cuenta de menor, la cerramos y borramos datos asociados.</li>
            </ul>
        </div>

        <h2 className="text-2xl font-bold text-white pt-4">1. Datos que tratamos</h2>
        <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-white">Cuenta/registro (si aplica):</strong> email, alias, nombre, edad.</li>
            <li><strong className="text-white">Acceso con Google:</strong> recibimos datos mínimos necesarios (identificador, email verificado, nombre/alias) mediante Firebase.</li>
            <li><strong className="text-white">Comunicaciones:</strong> tu email para newsletter (si te suscribes) y mensajes operativos.</li>
            <li><strong className="text-white">Datos técnicos:</strong> IP y user-agent para seguridad/anti-abuso, analítica y diagnóstico.</li>
            <li><strong className="text-white">Pagos en apps:</strong> si pagas en una app o tienda de terceros, el tercero procesa tu pago; Spartan Club no almacena números de tarjeta.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">2. Finalidades y bases legales</h2>
        <p>Bases legales: ejecución del servicio; consentimiento (newsletter, ciertos trazadores); interés legítimo (seguridad, métricas mínimas), y cumplimiento de obligaciones legales cuando apliquen.</p>

        <h2 className="text-2xl font-bold text-white pt-4">3. Analítica, trazadores y terceros</h2>
        <p>Podemos usar herramientas de analítica/marketing (p. ej., Google Analytics, PostHog o equivalentes) y servicios de envío de correos (p. ej., Brevo). Estas herramientas pueden usar identificadores o cookies. Mantendremos una lista actualizada de proveedores y cookies en una página informativa. Si tu país exige consentimiento previo, mostraremos un aviso de cookies para aceptarlas o rechazarlas.</p>

        <h2 className="text-2xl font-bold text-white pt-4">4. Proveedores y transferencias</h2>
        <p>Hosting y entrega: Vercel. Autenticación: Firebase (Google). Email marketing/transaccional: Brevo u otro proveedor similar. Estos proveedores pueden estar fuera de tu país; aplicamos medidas contractuales y técnicas razonables para proteger tus datos.</p>

        <h2 className="text-2xl font-bold text-white pt-4">5. Conservación</h2>
        <p>Cuenta y perfil: mientras esté activa o hasta que la elimines; una vez pidas baja, suprimimos en ≤30 días. Newsletter: mientras mantengas la suscripción. Registros técnicos/seguridad: por un tiempo razonable (p. ej., hasta 12 meses).</p>

        <h2 className="text-2xl font-bold text-white pt-4">6. Tus derechos</h2>
        <p>Puedes ejercer: acceso, actualización, rectificación, eliminación y oposición. Solicítalo escribiendo a spartanmarket@gmail.com desde el correo asociado a tu cuenta.</p>

        <h2 className="text-2xl font-bold text-white pt-4">7. Menores de edad</h2>
        <p>Spartan Club es solo para mayores de 18 años. Si detectamos datos de menores, eliminaremos la cuenta.</p>

        <h2 className="text-2xl font-bold text-white pt-4">8. Seguridad</h2>
        <p>Aplicamos medidas razonables: cifrado en tránsito (HTTPS), buenas prácticas de contraseñas y controles de acceso. Ningún sistema es infalible.</p>

        <h2 className="text-2xl font-bold text-white pt-4">9. Cambios en esta política</h2>
        <p>Podemos actualizarla. Publicaremos la versión vigente y, si el cambio es relevante, te avisaremos en el sitio o por email.</p>

        <h2 className="text-2xl font-bold text-white pt-4">10. Contacto</h2>
        <p>Dudas o solicitudes sobre privacidad: spartanmarket@gmail.com</p>
      </div>
    </main>
  );
}
