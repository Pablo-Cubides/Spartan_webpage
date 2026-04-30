# Pagos Runbook

Sistema: MercadoPago + Stripe | Modelo: `Purchase` | Env: `MERCADOPAGO_*`, `STRIPE_*`

---

## 1. Webhook no llega / pago queda en `pending`

### Síntomas
- Usuario reporta que pagó pero no tiene créditos.
- `Purchase.status` sigue en `pending` en DB.

### Diagnóstico

```sql
-- Ver purchases pendientes recientes
SELECT id, user_id, payment_id, status, gateway, created_at
FROM "Purchase"
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 20;
```

Verifica logs del servidor (Vercel → Functions → `/api/payments/webhook`):
- ¿Aparece el intento del webhook?
- ¿Hay error de firma (`invalid_signature`)?
- ¿Hay error de configuración (`webhook_not_configured`)?

### Pasos

**MercadoPago:**
1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.co/developers) → Webhooks → ver historial de intentos.
2. Identificar el evento por `payment_id`. Verificar que apuntó a `https://<dominio>/api/payments/webhook`.
3. Si falló por firma: verificar que `MERCADOPAGO_WEBHOOK_SECRET` en Vercel coincide con el configurado en el portal de MP.
4. Reintento manual: desde el portal de MP → botón "Reenviar notificación".

**Stripe:**
1. Ir a [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks → ver eventos fallidos.
2. Click en el evento `checkout.session.completed` → "Reenviar evento".
3. Verificar que `STRIPE_WEBHOOK_SECRET` en Vercel comienza con `whsec_` y coincide con el configurado en el dashboard.

### Resolución manual (último recurso)

Si el pago está confirmado en el portal del proveedor pero el webhook no llega:

```sql
-- Solo ejecutar si el pago está CONFIRMADO en el portal del proveedor
UPDATE "Purchase"
SET status = 'completed', completed_at = NOW(), payment_id = '<id_del_proveedor>'
WHERE id = <purchase_id> AND status = 'pending';

UPDATE "User"
SET credits = credits + <credits_received>
WHERE id = <user_id>;
```

Documentar el ajuste manual en el canal de operaciones.

---

## 2. Créditos otorgados dos veces (doble webhook)

### Síntomas
- Usuario tiene más créditos de los esperados.
- `CreditUsage` muestra registros duplicados o `Purchase.completed_at` fue actualizado dos veces.

### Diagnóstico

```sql
-- Verificar si hubo actualización doble
SELECT id, status, completed_at, credits_received FROM "Purchase" WHERE id = <id>;
SELECT credits FROM "User" WHERE id = <user_id>;
```

Si los créditos son exactamente el doble: el guard `purchase.status !== 'completed'` falló (race condition en alta concurrencia).

### Corrección

```sql
-- Revertir créditos extra
UPDATE "User"
SET credits = credits - <credits_received>
WHERE id = <user_id>;
```

Documentar y abrir issue para añadir lock de base de datos en la actualización.

---

## 3. Firma de webhook inválida

### Síntomas
- Logs muestran `[Webhook] Invalid MercadoPago signature` → `403`.
- Pagos válidos del proveedor son rechazados.

### Causas comunes
- `MERCADOPAGO_WEBHOOK_SECRET` en Vercel no coincide con el del portal de MP.
- El webhook fue creado con un secret diferente al de producción.
- El cuerpo del request fue modificado en tránsito (proxy/CDN).

### Pasos
1. En Vercel → Settings → Environment Variables: copiar el valor de `MERCADOPAGO_WEBHOOK_SECRET`.
2. En portal de MP → Webhooks → ver el secret configurado para ese endpoint.
3. Si no coinciden: actualizar en Vercel y hacer redeploy.
4. Para Stripe: regenerar el signing secret en Dashboard → Webhooks → endpoint → "Roll secret".

---

## 4. Rotación de secrets de webhook

**Frecuencia recomendada:** cada 90 días o ante sospecha de compromiso.

### MercadoPago
1. Portal MP → Developers → Webhooks → editar endpoint → regenerar secret.
2. Actualizar `MERCADOPAGO_WEBHOOK_SECRET` en Vercel (Settings → Environment Variables).
3. Redeploy en Vercel.
4. Verificar con un pago de prueba que los webhooks se procesan correctamente.

### Stripe
1. Dashboard Stripe → Developers → Webhooks → seleccionar endpoint → "Roll secret".
2. Actualizar `STRIPE_WEBHOOK_SECRET` en Vercel.
3. Redeploy.
4. Verificar en Stripe Dashboard → Events que el próximo evento llega con `200`.

---

## 5. Reconciliación de pagos

Ejecutar mensualmente o ante discrepancias reportadas.

```sql
-- Compras completadas sin créditos (user.credits debería reflejar el total)
SELECT p.id, p.user_id, p.credits_received, p.completed_at, u.credits
FROM "Purchase" p
JOIN "User" u ON u.id = p.user_id
WHERE p.status = 'completed'
AND p.completed_at > NOW() - INTERVAL '30 days'
ORDER BY p.completed_at DESC;

-- Compras pending de más de 24h (posible webhook perdido)
SELECT id, user_id, payment_id, gateway, created_at
FROM "Purchase"
WHERE status = 'pending'
AND created_at < NOW() - INTERVAL '24 hours';
```

Para cada `pending` de más de 24h: verificar manualmente en el portal del proveedor y aplicar el paso de "resolución manual" si el pago fue aprobado.

---

## 6. Variables de entorno requeridas

| Variable | Descripción | Quién la configura |
|----------|------------|-------------------|
| `MERCADOPAGO_ACCESS_TOKEN` | Bearer token para API de MP | Portal MP → Credenciales |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret HMAC para validar webhooks | Portal MP → Webhooks |
| `STRIPE_SECRET_KEY` | API key de Stripe (`sk_live_...`) | Dashboard Stripe → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Secret para validar webhooks Stripe (`whsec_...`) | Dashboard Stripe → Webhooks |
| `BREVO_TEMPLATE_PURCHASE` | ID de template de email de compra (default: 2) | Brevo → Templates |
