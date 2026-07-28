/**
 * Email HTML Templates for Spartan Club
 * Brand Colors:
 * - Primary Red: #C62828
 * - Dark Background: #0a0a0a, #1a1a1a
 * - Text: #ffffff, #D1D5DB
 */

// Base template structure
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Triarvon</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background-color: #C62828;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .button:hover {
      background-color: #a21d1d;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .button {
        display: block !important;
        width: 90% !important;
      }
    }
  </style>
</head>
<body style="background-color: #0a0a0a; margin: 0; padding: 0;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
          
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
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 30px 40px; text-align: center; border-top: 1px solid #303030;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="margin: 0; color: #9CA3AF; font-size: 14px; line-height: 1.6;">
                      <strong style="color: #C62828;">Triarvon</strong><br>
                      Forjando hombres, moldeando destinos.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <a href="https://spartanclub.vercel.app" style="color: #C62828; text-decoration: none; margin: 0 10px; font-size: 24px;">🏠</a>
                    <a href="https://spartanclub.vercel.app/blog" style="color: #C62828; text-decoration: none; margin: 0 10px; font-size: 24px;">📚</a>
                    <a href="https://spartanclub.vercel.app/herramientas" style="color: #C62828; text-decoration: none; margin: 0 10px; font-size: 24px;">⚙️</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0; color: #666; font-size: 12px; line-height: 1.5;">
                      © 2026 Triarvon. Todos los derechos reservados.<br>
                      <a href="https://spartanclub.vercel.app/politica-de-privacidad" style="color: #C62828; text-decoration: none;">Política de Privacidad</a> | 
                      <a href="https://spartanclub.vercel.app/terminos-y-condiciones" style="color: #C62828; text-decoration: none;">Términos y Condiciones</a><br>
                      <a href="{{unsubscribe}}" style="color: #888; text-decoration: none; font-size: 11px;">Cancelar suscripción</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Welcome Email Template
 */
export const welcomeTemplate = (name: string) =>
  baseTemplate(`
  <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 28px; font-weight: bold;">
    ¡Bienvenido a la Legión, ${name}!
  </h2>
  
  <p style="margin: 0 0 20px; color: #D1D5DB; font-size: 16px; line-height: 1.8;">
    Has dado el primer paso hacia tu transformación. En Triarvon no creemos en atajos ni en excusas. 
    Aquí forjamos hombres que dominan su mente, su cuerpo y su destino.
  </p>
  
  <p style="margin: 0 0 30px; color: #D1D5DB; font-size: 16px; line-height: 1.8;">
    <strong style="color: #C62828;">¿Qué te espera?</strong><br>
    ✓ Artículos semanales sobre disciplina, entrenamiento y estilo<br>
    ✓ Acceso a herramientas exclusivas de IA<br>
    ✓ Estrategias probadas para tu crecimiento personal<br>
    ✓ Una comunidad de hombres con propósito
  </p>
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <a href="https://spartanclub.vercel.app/blog" class="button" style="background-color: #C62828; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 4px; font-weight: bold; text-transform: uppercase; display: inline-block;">
          Explorar el Blog
        </a>
      </td>
    </tr>
  </table>
  
  <p style="margin: 30px 0 0; color: #9CA3AF; font-size: 14px; line-height: 1.6; font-style: italic; border-left: 3px solid #C62828; padding-left: 15px;">
    "La disciplina es el puente entre tus metas y tus logros."<br>
    <span style="color: #666;">— Filosofía Espartana</span>
  </p>
`);

/**
 * Newsletter Template
 */
export const newsletterTemplate = (params: {
  title: string;
  preview: string;
  content: string;
  ctaText: string;
  ctaUrl: string;
}) =>
  baseTemplate(`
  <h2 style="margin: 0 0 10px; color: #ffffff; font-size: 24px; font-weight: bold;">
    ${params.title}
  </h2>
  
  <p style="margin: 0 0 30px; color: #9CA3AF; font-size: 14px;">
    ${params.preview}
  </p>
  
  <div style="margin: 0 0 30px; color: #D1D5DB; font-size: 16px; line-height: 1.8;">
    ${params.content}
  </div>
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <a href="${params.ctaUrl}" class="button" style="background-color: #C62828; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 4px; font-weight: bold; text-transform: uppercase; display: inline-block;">
          ${params.ctaText}
        </a>
      </td>
    </tr>
  </table>
`);

/**
 * Purchase Confirmation Template
 */
export const purchaseTemplate = (params: {
  name: string;
  packageName: string;
  credits: number;
  amount: number;
}) =>
  baseTemplate(`
  <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 28px; font-weight: bold;">
    ¡Compra Confirmada, ${params.name}!
  </h2>
  
  <p style="margin: 0 0 30px; color: #D1D5DB; font-size: 16px; line-height: 1.8;">
    Tu inversión en tu desarrollo personal ha sido procesada exitosamente. 
    Ahora tienes más poder para transformarte.
  </p>
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0f0f0f; border-radius: 8px; margin-bottom: 30px;">
    <tr>
      <td style="padding: 30px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #303030;">
              <p style="margin: 0; color: #9CA3AF; font-size: 14px;">Paquete:</p>
              <p style="margin: 5px 0 0; color: #ffffff; font-size: 18px; font-weight: bold;">${params.packageName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #303030;">
              <p style="margin: 0; color: #9CA3AF; font-size: 14px;">Créditos añadidos:</p>
              <p style="margin: 5px 0 0; color: #C62828; font-size: 24px; font-weight: bold;">${params.credits} créditos</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <p style="margin: 0; color: #9CA3AF; font-size: 14px;">Total pagado:</p>
              <p style="margin: 5px 0 0; color: #ffffff; font-size: 18px; font-weight: bold;">$${params.amount.toLocaleString()} COP</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <a href="https://spartanclub.vercel.app/herramientas" class="button" style="background-color: #C62828; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 4px; font-weight: bold; text-transform: uppercase; display: inline-block;">
          Usar mis Créditos
        </a>
      </td>
    </tr>
  </table>
  
  <p style="margin: 30px 0 0; color: #9CA3AF; font-size: 14px; line-height: 1.6;">
    Si tienes alguna pregunta sobre tu compra, contacta a nuestro equipo en 
    <a href="mailto:spartanmarketcol@gmail.com" style="color: #C62828; text-decoration: none;">spartanmarketcol@gmail.com</a>
  </p>
`);

/**
 * Credit Low Notification Template
 */
export const creditLowTemplate = (params: {
  name: string;
  creditsRemaining: number;
}) =>
  baseTemplate(`
  <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 28px; font-weight: bold;">
    Tus Créditos se están Agotando
  </h2>
  
  <p style="margin: 0 0 20px; color: #D1D5DB; font-size: 16px; line-height: 1.8;">
    Hola ${params.name},
  </p>
  
  <p style="margin: 0 0 30px; color: #D1D5DB; font-size: 16px; line-height: 1.8;">
    Te quedan <strong style="color: #C62828;">${params.creditsRemaining} créditos</strong>. 
    No dejes que se detenga tu progreso. Recarga ahora y sigue forjando tu mejor versión.
  </p>
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <a href="https://spartanclub.vercel.app/credits" class="button" style="background-color: #C62828; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 4px; font-weight: bold; text-transform: uppercase; display: inline-block;">
          Recargar Créditos
        </a>
      </td>
    </tr>
  </table>
  
  <p style="margin: 30px 0 0; color: #9CA3AF; font-size: 14px; line-height: 1.6; background-color: #0f0f0f; padding: 15px; border-radius: 4px; border-left: 3px solid #C62828;">
    <strong style="color: #ffffff;">¿Necesitas ayuda?</strong><br>
    Nuestro equipo está listo para asistirte en cualquier momento.
  </p>
`);

// Export all templates
export const emailTemplates = {
  welcome: welcomeTemplate,
  newsletter: newsletterTemplate,
  purchase: purchaseTemplate,
  creditLow: creditLowTemplate,
};
