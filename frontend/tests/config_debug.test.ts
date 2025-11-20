
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getActionCost } from '../../src/lib/asesor-estilo/credits';
import { APP_CONFIG } from '../../src/lib/asesor-estilo/config/app.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function runAsesorEstiloConfigTest() {
  console.log('🚀 Testing Asesor Estilo Configuration...');

  try {
    // 1. Check API Key
    const geminiKey = process.env.PERSONAL_SHOPPER_GEMINI_KEY || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      throw new Error('❌ Missing GEMINI_API_KEY or PERSONAL_SHOPPER_GEMINI_KEY in .env.local');
    }
    console.log('✅ API Key is configured.');

    // 2. Check Credit Costs
    const analyzeCost = getActionCost('analyze');
    const generateCost = getActionCost('generate');

    console.log(`Cost per analysis: ${analyzeCost}`);
    console.log(`Cost per generation: ${generateCost}`);

    if (analyzeCost !== APP_CONFIG.credits.COST_PER_ANALYSIS) {
        throw new Error('❌ Analyze cost mismatch with config');
    }
    if (generateCost !== APP_CONFIG.credits.COST_PER_GENERATION) {
        throw new Error('❌ Generate cost mismatch with config');
    }
    console.log('✅ Credit costs are correctly configured.');

  } catch (error) {
    console.error('❌ Test Failed:', error);
    throw error;
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAsesorEstiloConfigTest();
}

export { runAsesorEstiloConfigTest };
