# Análisis Detallado del Flujo de Pagos con Mercado Pago

Este documento describe el ciclo de vida completo de una transacción, desde la solicitud del usuario hasta la confirmación y acreditación de los créditos. El proceso es robusto y está distribuido en tres archivos principales:

1.  `frontend/src/app/api/credits/buy/route.ts` (El iniciador de la compra)
2.  `frontend/src/lib/server/mercadopago.ts` (El comunicador con Mercado Pago)
3.  `frontend/src/app/api/payments/webhook/route.ts` (El receptor de notificaciones)

---

## Flujo de la Transacción

### Paso 1: Inicio de la Compra (Cliente ➞ Servidor)

1.  **Solicitud del Cliente:** Un usuario autenticado en la aplicación decide comprar un paquete de créditos. El frontend envía una solicitud `POST` a `/api/credits/buy` incluyendo el `package_id` del paquete deseado.

2.  **Autenticación y Validación (`buy/route.ts`):**
    - El servidor recibe la solicitud y primero verifica la identidad del usuario usando el token de Firebase enviado en la cabecera `Authorization`.
    - Luego, valida que el `package_id` recibido es correcto y existe en la base de datos.

3.  **Creación de un Pedido Provisional (`buy/route.ts`):**
    - Se crea un registro en la tabla `Purchase` de la base de datos.
    - Este registro contiene los detalles de la compra (ID de usuario, ID de paquete, etc.) y se establece su estado inicial como `'pending'`. Este es un paso crucial para tener un registro de la transacción antes de que se pague.
    - El ID de esta compra se guardará para usarlo como referencia en Mercado Pago.

### Paso 2: Creación de la Preferencia de Pago (Servidor ➞ Mercado Pago)

1.  **Llamada al Módulo de Pago (`buy/route.ts`):**
    - La ruta de compra llama a la función `createPreference` del archivo `lib/server/mercadopago.ts`.
    - Le pasa todos los detalles necesarios: el nombre del item, su precio, y, lo más importante, el **ID de la compra** creada en el paso anterior como `external_reference`.

2.  **Comunicación con Mercado Pago (`mercadopago.ts`):**
    - Esta función toma todos los datos y construye una petición oficial a la API de Mercado Pago (`/checkout/preferences`).
    - Envía la petición firmada con el `MERCADOPAGO_ACCESS_TOKEN` del servidor.
    - Si todo es correcto, Mercado Pago responde con un objeto `preference`, que contiene un `id` único y una `init_point` (la URL a la que el usuario debe ser redirigido para pagar).

3.  **Respuesta al Cliente (`buy/route.ts`):**
    - El servidor recibe la respuesta de Mercado Pago.
    - Actualiza el registro de la `Purchase` en la base de datos con el `payment_id` recibido de Mercado Pago para tener una trazabilidad completa.
    - Envía la `preference` (incluida la URL de pago) de vuelta al navegador del cliente.

### Paso 3: Pago del Usuario (Cliente ➞ Mercado Pago)

1.  **Redirección:** El frontend recibe la URL de pago (`init_point`) y redirige al usuario a la página de Mercado Pago.
2.  **Proceso de Pago:** El usuario completa el pago utilizando los métodos ofrecidos por Mercado Pago.
3.  **Notificación al Servidor (Webhook):** Una vez que el pago es aprobado (o rechazado), Mercado Pago envía una notificación automática (un `POST` request) a la URL de Webhook configurada en el proyecto: `api/payments/webhook`.

### Paso 4: Verificación y Acreditación (Mercado Pago ➞ Servidor)

1.  **Recepción del Webhook (`webhook/route.ts`):**
    - El servidor recibe la notificación en `api/payments/webhook`.
    - **Medida de Seguridad 1 (Verificación de Firma):** El endpoint verifica la autenticidad del webhook. Compara una firma enviada en las cabeceras (`x-signature`) con una firma generada localmente usando un secreto compartido (`MERCADOPAGO_WEBHOOK_SECRET`). Esto garantiza que la solicitud proviene realmente de Mercado Pago y no de un tercero malicioso.
    - **Medida de Seguridad 2 (Verificación del Pago):** Aunque la firma sea válida, el servidor no confía ciegamente en el contenido del webhook. Toma el `payment_id` recibido y hace una consulta directa a la API de Mercado Pago para obtener el estado real y verificado de ese pago.

2.  **Actualización del Estado de la Compra (`webhook/route.ts`):**
    - Usando la `external_reference` (que es el ID de la `Purchase` original) obtenida de la consulta a Mercado Pago, el servidor busca el registro correspondiente en su propia base de datos.
    - Si el pago fue `approved` (aprobado):
        - El estado de la `Purchase` se cambia de `'pending'` a `'completed'`.
        - **Se acreditan los créditos al usuario**, incrementando el valor en su perfil.
        - Se envía un correo electrónico de confirmación de la compra al usuario.
    - Si el pago fue rechazado (`failed`) o sigue pendiente (`pending`), se actualiza el estado de la `Purchase` correspondientemente, sin acreditar créditos.

## Conclusión

El flujo de pagos está muy bien implementado, con un alto nivel de seguridad y robustez. Se manejan los estados intermedios (compras pendientes), se verifica la autenticidad de todas las comunicaciones con el proveedor de pagos y se asegura que los créditos solo se entreguen cuando el pago ha sido completamente verificado. Todo el proceso está correctamente desacoplado en diferentes módulos, lo que facilita su mantenimiento y escalabilidad.
