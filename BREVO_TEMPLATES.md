# 🎨 Plantillas HTML para Brevo - Copy & Paste

## Template 1: Welcome Email (Bienvenida)

**Nombre:** `Spartan Club - Welcome`  
**Variables:** `NAME`

### HTML para copiar en Brevo:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Spartan Club</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0a0a0a; }
    table { border-collapse: collapse; }
    .button { 
      display: inline-block; 
      padding: 16px 32px; 
      background-color: #C62828; 
      color: #ffffff !important; 
      text-decoration: none; 
      border-radius: 4px; 
      font-weight: bold; 
      text-transform: uppercase; 
    }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .button { width: 90% !important; }
    }
  </style>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 0;">
  <table role="presentation" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 0;">
        <table class="container" width="600" style="margin: 0 auto; background-color: #1a1a1a; border-radius: 8px;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #C62828 0%, #8B0000 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                ⚔️ SPARTAN CLUB
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 28px; font-weight: bold;">
                ¡Bienvenido a la Legión, {{ params.NAME }}!
              </h2>
              
              <p style="margin: 0 0 20px; color: #D1D5DB; font-size: 16px; line-height: 1.8;">
                Has dado el primer paso hacia tu transformación. En Spartan Club no creemos en atajos ni en excusas. 
                Aquí forjamos hombres que dominan su mente, su cuerpo y su destino.
              </p>
              
              <p style="margin: 0 0 30px; color: #D1D5DB; font-size: 16px; line-height: 1.8;">
                <strong style="color: #C62828;">¿Qué te espera?</strong><br>
                ✓ Artículos semanales sobre disciplina, entrenamiento y estilo<br>
                ✓ Acceso a herramientas exclusivas de IA<br>
                ✓ Estrategias probadas para tu crecimiento personal<br>
                ✓ Una comunidad de hombres con propósito
              </p>
              
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://spartanclub.co/blog" class="button" style="background-color: #C62828; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 4px; font-weight: bold; text-transform: uppercase; display: inline-block;">
                      Explorar el Blog
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #9CA3AF; font-size: 14px; line-height: 1.6; font-style: italic; border-left: 3px solid #C62828; padding-left: 15px;">
                "La disciplina es el puente entre tus metas y tus logros."<br>
                <span style="color: #666;">— Filosofía Espartana</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 30px 40px; text-align: center; border-top: 1px solid #303030;">
              <p style="margin: 0 0 20px; color: #9CA3AF; font-size: 14px;">
                <strong style="color: #C62828;">Spartan Club</strong><br>
                Forjando hombres, moldeando destinos.
              </p>
              <p style="margin: 0; color: #666; font-size: 12px;">
                © 2026 Spartan Club. Todos los derechos reservados.<br>
                <a href="https://spartanclub.co/politica-de-privacidad" style="color: #C62828; text-decoration: none;">Política de Privacidad</a> | 
                <a href="{{ unsubscribe }}" style="color: #888; text-decoration: none;">Cancelar suscripción</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 2: Purchase Confirmation (Confirmación de Compra)

**Nombre:** `Spartan Club - Purchase`  
**Variables:** `NAME`, `PACKAGE_NAME`, `CREDITS`, `AMOUNT`

### HTML para copiar en Brevo:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compra Confirmada - Spartan Club</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0a0a0a; }
    table { border-collapse: collapse; }
    .button { 
      display: inline-block; 
      padding: 16px 32px; 
      background-color: #C62828; 
      color: #ffffff !important; 
      text-decoration: none; 
      border-radius: 4px; 
      font-weight: bold; 
      text-transform: uppercase; 
    }
  </style>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 0;">
  <table role="presentation" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 0;">
        <table class="container" width="600" style="margin: 0 auto; background-color: #1a1a1a; border-radius: 8px;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #C62828 0%, #8B0000 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                ⚔️ SPARTAN CLUB
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 28px; font-weight: bold;">
                ¡Compra Confirmada, {{ params.NAME }}!
              </h2>
              
              <p style="margin: 0 0 30px; color: #D1D5DB; font-size: 16px; line-height: 1.8;">
                Tu inversión en tu desarrollo personal ha sido procesada exitosamente. 
                Ahora tienes más poder para transformarte.
              </p>
              
              <!-- Details Box -->
              <table width="100%" style="background-color: #0f0f0f; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px;">
                    <table width="100%">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #303030;">
                          <p style="margin: 0; color: #9CA3AF; font-size: 14px;">Paquete:</p>
                          <p style="margin: 5px 0 0; color: #ffffff; font-size: 18px; font-weight: bold;">{{ params.PACKAGE_NAME }}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #303030;">
                          <p style="margin: 0; color: #9CA3AF; font-size: 14px;">Créditos añadidos:</p>
                          <p style="margin: 5px 0 0; color: #C62828; font-size: 24px; font-weight: bold;">{{ params.CREDITS }} créditos</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="margin: 0; color: #9CA3AF; font-size: 14px;">Total pagado:</p>
                          <p style="margin: 5px 0 0; color: #ffffff; font-size: 18px; font-weight: bold;">${{ params.AMOUNT }} COP</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://spartanclub.co/herramientas" class="button" style="background-color: #C62828; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 4px; font-weight: bold; text-transform: uppercase; display: inline-block;">
                      Usar mis Créditos
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #9CA3AF; font-size: 14px; line-height: 1.6;">
                Si tienes alguna pregunta sobre tu compra, contacta a nuestro equipo en 
                <a href="mailto:spartanmarketcol@gmail.com" style="color: #C62828; text-decoration: none;">spartanmarketcol@gmail.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 30px 40px; text-align: center; border-top: 1px solid #303030;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © 2026 Spartan Club. Todos los derechos reservados.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📋 Instrucciones de Instalación

### Paso 1: Acceder a Brevo
1. Ve a https://app.brevo.com
2. Inicia sesión con tu cuenta

### Paso 2: Crear Template Welcome
1. Ve a **Campaigns** → **Templates**
2. Click **Create a template**
3. Selecciona **Blank template**
4. Nombre: `Spartan Club - Welcome`
5. Click en **</> Code editor**
6. Borra todo el contenido
7. **Copia y pega el HTML completo del Template 1**
8. Click **Save**
9. **Copia el Template ID** (aparece en la URL o en la lista)

### Paso 3: Crear Template Purchase
1. Repite el proceso anterior
2. Nombre: `Spartan Club - Purchase`
3. Usa el HTML del Template 2
4. Guarda y copia el ID

### Paso 4: Configurar Variables de Entorno
Agrega a tu `.env.local`:

```env
BREVO_API_KEY=tu-api-key
BREVO_SENDER_EMAIL=spartanmarketcol@gmail.com
BREVO_TEMPLATE_WELCOME=ID_del_template_welcome
BREVO_TEMPLATE_PURCHASE=ID_del_template_purchase
```

### Paso 5: Probar
```bash
cd frontend
node test-brevo.js tu-email@ejemplo.com
```

## ✅ Checklist

- [ ] API Key configurada
- [ ] IP autorizada (181.59.2.174/32) ✅
- [ ] Template Welcome creado
- [ ] Template Purchase creado
- [ ] IDs agregados a .env.local
- [ ] Test ejecutado exitosamente

## 🎨 Colores de Marca

Los templates usan estos colores:
- **Rojo Principal**: `#C62828` 
- **Rojo Oscuro**: `#8B0000`
- **Fondo**: `#0a0a0a`, `#1a1a1a`
- **Texto**: `#ffffff`, `#D1D5DB`
- **Secundario**: `#9CA3AF`

## 💡 Tips

1. **Preview antes de guardar**: Usa el botón "Preview" en Brevo
2. **Test con variables reales**: Brevo permite enviar emails de prueba
3. **Mobile responsive**: Los templates son responsive automáticamente
4. **Personalización**: Puedes cambiar textos sin romper el diseño
