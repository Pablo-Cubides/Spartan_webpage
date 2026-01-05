# Configuración de Brevo para Spartan Club

## 🎨 Plantillas de Email

Este proyecto incluye plantillas HTML personalizadas con los colores y estilo de Spartan Club.

### Colores de la Marca
- **Rojo Principal**: #C62828
- **Fondo Oscuro**: #0a0a0a, #1a1a1a
- **Texto**: #ffffff, #D1D5DB
- **Acentos**: #9CA3AF

## 📧 Configuración en Brevo

### 1. Crear Cuenta en Brevo
1. Ve a https://app.brevo.com
2. Crea una cuenta o inicia sesión
3. Verifica tu email

### 2. Obtener API Key
1. Ve a **Settings** > **API Keys**
2. Crea una nueva API Key v3
3. Copia la key y guárdala en tu `.env.local`:
   ```
   BREVO_API_KEY=tu-api-key-aqui
   BREVO_SENDER_EMAIL=spartanmarketcol@gmail.com
   ```

### 3. Configurar Dominio de Envío (Opcional pero recomendado)
1. Ve a **Senders & IP** > **Domains**
2. Agrega tu dominio `spartanclub.co`
3. Configura los registros DNS (SPF, DKIM)
4. Verifica el dominio

### 4. Crear Listas de Contactos
1. Ve a **Contacts** > **Lists**
2. Crea estas listas:
   - `Newsletter` (para suscriptores del newsletter)
   - `Users` (para usuarios registrados)
3. Copia los IDs de las listas y agrégalos a `.env.local`:
   ```
   BREVO_LIST_NEWSLETTER=ID_de_lista_newsletter
   BREVO_LIST_USERS=ID_de_lista_users
   ```

### 5. Crear Plantillas en Brevo

#### Plantilla 1: Welcome Email
1. Ve a **Campaigns** > **Templates** > **Create a template**
2. Nombre: `Spartan Club - Welcome`
3. Usa el código de `templates.ts` función `welcomeTemplate`
4. Variables dinámicas: `{{params.NAME}}`
5. Guarda y copia el Template ID:
   ```
   BREVO_TEMPLATE_WELCOME=ID_del_template
   ```

#### Plantilla 2: Newsletter
1. Crea otra plantilla: `Spartan Club - Newsletter`
2. Usa el código de `newsletterTemplate`
3. Variables: `{{params.TITLE}}`, `{{params.PREVIEW}}`, `{{params.CONTENT}}`, `{{params.CTA_TEXT}}`, `{{params.CTA_URL}}`
4. Guarda el ID:
   ```
   BREVO_TEMPLATE_NEWSLETTER=ID_del_template
   ```

#### Plantilla 3: Purchase Confirmation
1. Crea: `Spartan Club - Purchase Confirmation`
2. Usa `purchaseTemplate`
3. Variables: `{{params.NAME}}`, `{{params.PACKAGE_NAME}}`, `{{params.CREDITS}}`, `{{params.AMOUNT}}`
4. Guarda el ID:
   ```
   BREVO_TEMPLATE_PURCHASE=ID_del_template
   ```

#### Plantilla 4: Credit Low
1. Crea: `Spartan Club - Credit Low`
2. Usa `creditLowTemplate`
3. Variables: `{{params.NAME}}`, `{{params.CREDITS_REMAINING}}`
4. Guarda el ID:
   ```
   BREVO_TEMPLATE_CREDIT_LOW=ID_del_template
   ```

### 6. Configurar IP Autorizada (Ya hecho ✅)
La IP `181.59.2.174/32` de Telmex Colombia ya está autorizada.

## 🔧 Variables de Entorno Completas

Agrega estas variables a tu archivo `.env.local`:

```env
# Brevo Configuration
BREVO_API_KEY=tu-api-key-de-brevo
BREVO_SENDER_EMAIL=spartanmarketcol@gmail.com

# Template IDs (obtener después de crear las plantillas)
BREVO_TEMPLATE_WELCOME=1
BREVO_TEMPLATE_NEWSLETTER=2
BREVO_TEMPLATE_PURCHASE=3
BREVO_TEMPLATE_CREDIT_LOW=4

# List IDs (obtener después de crear las listas)
BREVO_LIST_NEWSLETTER=1
BREVO_LIST_USERS=2
```

## 🚀 Uso en el Código

### Suscribir a Newsletter
```typescript
import { brevoClient } from '@/lib/brevo';

await brevoClient.subscribeToNewsletter('user@example.com', 'Juan');
```

### Enviar Email de Compra
```typescript
await brevoClient.sendPurchaseConfirmation('user@example.com', {
  name: 'Juan',
  packageName: 'Paquete Guerrero',
  credits: 50,
  amount: 30000
});
```

### Enviar Email Personalizado
```typescript
await brevoClient.sendTransactionalEmail({
  to: [{ email: 'user@example.com', name: 'Juan' }],
  subject: 'Asunto del email',
  htmlContent: '<h1>Contenido HTML</h1>',
});
```

## 📊 Testing

### Test en Local
```bash
# Asegúrate de tener las variables de entorno configuradas
npm run dev

# Prueba el endpoint de newsletter
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### Verificar en Brevo
1. Ve a **Campaigns** > **Transactional**
2. Revisa los emails enviados
3. Verifica estadísticas de apertura y clics

## 🎨 Personalizar Plantillas

Las plantillas están en `src/lib/brevo/templates.ts`. Puedes:
- Modificar colores
- Agregar secciones
- Cambiar textos
- Agregar imágenes (usar URLs absolutas)

Después de modificar, actualiza las plantillas en Brevo copiando el HTML generado.

## ⚠️ Notas Importantes

1. **Free Plan**: Brevo free permite 300 emails/día
2. **Testing**: Usa emails de prueba antes de enviar a usuarios reales
3. **Unsubscribe**: El link `{{unsubscribe}}` es manejado automáticamente por Brevo
4. **GDPR**: Las plantillas incluyen links de política de privacidad

## 📞 Soporte

- Documentación Brevo: https://developers.brevo.com
- Email de soporte: spartanmarketcol@gmail.com
