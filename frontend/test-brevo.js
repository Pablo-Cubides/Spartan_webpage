#!/usr/bin/env node
/**
 * Test Brevo Connection
 * 
 * Usage: node test-brevo.js test@example.com
 */

require('dotenv').config({ path: '.env.local' });

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.error('❌ ERROR: BREVO_API_KEY not found in .env.local');
  console.log('\n📝 Please add your Brevo API key to .env.local:');
  console.log('   BREVO_API_KEY=your-key-here\n');
  process.exit(1);
}

const testEmail = process.argv[2] || 'test@example.com';

async function testBrevoConnection() {
  console.log('🧪 Testing Brevo Connection...\n');
  console.log('API Key:', BREVO_API_KEY.substring(0, 10) + '...' + BREVO_API_KEY.slice(-4));
  console.log('Test Email:', testEmail);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    // Test 1: Get Account Info
    console.log('Test 1: Getting account info...');
    const accountRes = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': BREVO_API_KEY,
      },
    });

    if (!accountRes.ok) {
      throw new Error(`Account check failed: ${accountRes.status} ${await accountRes.text()}`);
    }

    const accountData = await accountRes.json();
    console.log('✅ Connected successfully!');
    console.log('   Company:', accountData.companyName || accountData.email);
    console.log('   Plan:', accountData.plan?.[0]?.type || 'Free');
    console.log('   Credits:', accountData.plan?.[0]?.credits || 'Unlimited');

    // Test 2: Test sending a simple email
    console.log('\nTest 2: Sending test email...');
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { 
          email: process.env.BREVO_SENDER_EMAIL || 'spartanmarketcol@gmail.com', 
          name: 'Spartan Club Test' 
        },
        to: [{ email: testEmail }],
        subject: 'Prueba de Conexión - Spartan Club',
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; padding: 40px;">
                <h1 style="color: #C62828; text-align: center; text-transform: uppercase;">
                  ⚔️ SPARTAN CLUB
                </h1>
                <h2 style="color: #ffffff;">Prueba de Conexión Exitosa</h2>
                <p style="color: #D1D5DB; line-height: 1.6;">
                  Si estás recibiendo este email, significa que la configuración de Brevo está funcionando correctamente.
                </p>
                <div style="margin: 30px 0; padding: 20px; background-color: #0f0f0f; border-left: 3px solid #C62828; border-radius: 4px;">
                  <p style="margin: 0; color: #9CA3AF; font-size: 14px;">
                    <strong style="color: #C62828;">Estado:</strong> ✅ Conectado<br>
                    <strong style="color: #C62828;">Fecha:</strong> ${new Date().toLocaleString('es-ES')}<br>
                    <strong style="color: #C62828;">Desde:</strong> ${process.env.BREVO_SENDER_EMAIL || 'spartanmarketcol@gmail.com'}
                  </p>
                </div>
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
                  © 2026 Spartan Club - Prueba de Sistema
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      throw new Error(`Email send failed: ${emailRes.status} ${errorText}`);
    }

    const emailData = await emailRes.json();
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', emailData.messageId);
    console.log('   To:', testEmail);

    // Test 3: Check lists
    console.log('\nTest 3: Checking contact lists...');
    const listsRes = await fetch('https://api.brevo.com/v3/contacts/lists', {
      headers: {
        'api-key': BREVO_API_KEY,
      },
    });

    if (listsRes.ok) {
      const listsData = await listsRes.json();
      console.log('✅ Found', listsData.lists?.length || 0, 'contact lists:');
      listsData.lists?.forEach((list) => {
        console.log(`   - ${list.name} (ID: ${list.id}) - ${list.totalSubscribers} subscribers`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n📧 Check your email at:', testEmail);
    console.log('\n💡 Next steps:');
    console.log('   1. Create email templates in Brevo dashboard');
    console.log('   2. Add template IDs to .env.local');
    console.log('   3. Create contact lists and add list IDs');
    console.log('   4. Test newsletter signup on your site\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.log('\n🔍 Common issues:');
    console.log('   - Invalid API key');
    console.log('   - IP not authorized (check Brevo dashboard)');
    console.log('   - Sender email not verified');
    console.log('   - Rate limit exceeded\n');
    process.exit(1);
  }
}

testBrevoConnection();
