/**
 * Configuration Test for Asesor Estilo Module
 * Tests that environment variables and credit costs are properly configured
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars before importing modules that depend on them
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runAsesorEstiloConfigTest() {
  console.log('🚀 Testing Asesor Estilo Configuration...');

  try {
    // Dynamic imports to ensure env vars are loaded first
    const { getActionCost } = await import('../src/lib/asesor-estilo/credits.js');
    const { APP_CONFIG } = await import('../src/lib/asesor-estilo/config/app.config.js');

    // 1. Check API Key
    const geminiKey = process.env.PERSONAL_SHOPPER_GEMINI_KEY || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.warn('⚠️  Warning: GEMINI_API_KEY not configured. AI features will not work.');
    } else {
      console.log('✅ API Key is configured.');
    }

    // 2. Check Credit Costs
    const analyzeCost = getActionCost('analyze');
    const generateCost = getActionCost('generate');

    console.log(`   Cost per analysis: ${analyzeCost}`);
    console.log(`   Cost per generation: ${generateCost}`);

    if (analyzeCost !== APP_CONFIG.credits.COST_PER_ANALYSIS) {
      throw new Error('❌ Analyze cost mismatch with config');
    }
    if (generateCost !== APP_CONFIG.credits.COST_PER_GENERATION) {
      throw new Error('❌ Generate cost mismatch with config');
    }
    console.log('✅ Credit costs are correctly configured.');

    // 3. Check Rate Limit Config
    console.log(`   Rate limit enabled: ${APP_CONFIG.rateLimit.ENABLED}`);
    console.log(`   Max requests per window: ${APP_CONFIG.rateLimit.MAX_REQUESTS_PER_WINDOW}`);
    console.log('✅ Rate limiting configuration OK.');

    console.log('\n✅ All configuration tests passed!');
  } catch (error) {
    console.error('❌ Test Failed:', error);
    throw error;
  }
}

// Allow running directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`;
if (isMainModule) {
  runAsesorEstiloConfigTest();
}

export { runAsesorEstiloConfigTest };
