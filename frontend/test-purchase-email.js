/**
 * Test script para probar el email de confirmación de compra
 * Uso: node test-purchase-email.js tu-email@ejemplo.com
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const TEMPLATE_ID = process.env.BREVO_TEMPLATE_PURCHASE; // O pega el ID aquí directamente

if (!BREVO_API_KEY) {
  console.error('❌ Falta BREVO_API_KEY en las variables de entorno');
  console.log('Crea un archivo .env.local con:');
  console.log('BREVO_API_KEY=tu-api-key');
  process.exit(1);
}

const testEmail = process.argv[2];
if (!testEmail) {
  console.error('❌ Proporciona un email para la prueba');
  console.log('Uso: node test-purchase-email.js tu-email@ejemplo.com');
  process.exit(1);
}

async function sendTestPurchaseEmail() {
  console.log('📧 Enviando email de prueba de compra...\n');
  
  const testData = {
    to: [
      {
        email: testEmail,
        name: 'Juan Pérez'
      }
    ],
    sender: {
      email: 'spartanmarketcol@gmail.com',
      name: 'Spartan Club'
    },
    params: {
      NAME: 'Juan Pérez',
      PACKAGE_NAME: 'Paquete Básico',
      CREDITS: '100',
      AMOUNT: '50000'
    }
  };

  // Si tienes el Template ID, úsalo
  if (TEMPLATE_ID) {
    testData.templateId = parseInt(TEMPLATE_ID);
    console.log('📋 Usando Template ID:', TEMPLATE_ID);
  } else {
    console.log('⚠️  No se encontró BREVO_TEMPLATE_PURCHASE');
    console.log('Enviando HTML directo como fallback...\n');
    
    // HTML del template de compra
    testData.htmlContent = `
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
                ¡Compra Confirmada, Juan Pérez!
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
                          <p style="margin: 5px 0 0; color: #ffffff; font-size: 18px; font-weight: bold;">Paquete Básico</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #303030;">
                          <p style="margin: 0; color: #9CA3AF; font-size: 14px;">Créditos añadidos:</p>
                          <p style="margin: 5px 0 0; color: #C62828; font-size: 24px; font-weight: bold;">100 créditos</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="margin: 0; color: #9CA3AF; font-size: 14px;">Total pagado:</p>
                          <p style="margin: 5px 0 0; color: #ffffff; font-size: 18px; font-weight: bold;">$50000 COP</p>
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
    `;
    testData.subject = '¡Compra Confirmada, Juan Pérez!';
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email enviado exitosamente!\n');
      console.log('📬 Detalles:');
      console.log('   • Destinatario:', testEmail);
      console.log('   • Nombre:', 'Juan Pérez');
      console.log('   • Paquete:', 'Paquete Básico');
      console.log('   • Créditos:', '100');
      console.log('   • Monto:', '$50000 COP');
      console.log('   • Message ID:', result.messageId);
      console.log('\n📧 Revisa tu bandeja de entrada (y spam)');
      console.log('Si las variables se ven bien, el template está configurado correctamente!');
    } else {
      console.error('❌ Error al enviar email:', result);
    }
  } catch (error) {
    console.error('❌ Error en la solicitud:', error.message);
  }
}

sendTestPurchaseEmail();
