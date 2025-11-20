
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading environment from ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.local:', result.error);
} else {
  console.log('Environment loaded successfully');
}

// Use dynamic import to ensure env vars are loaded before the config module is evaluated
export async function runAsesorEstiloConfigTest() {
  console.log('Starting Config Tests...');
  
  try {
    // Dynamic import to pick up the loaded env vars
    const { APP_CONFIG, validateConfig } = await import('../../src/lib/asesor-estilo/config/app.config');
    
    console.log('----------------------------------------');
    console.log('CONFIGURATION CHECK');
    console.log('----------------------------------------');

    // 1. Check Critical Environment Variables
    console.log('\n1. Checking Critical Environment Variables:');
    const validation = validateConfig();
    if (validation.valid) {
      console.log('✅ All critical environment variables are present');
    } else {
      console.error('❌ Missing environment variables:');
      validation.errors.forEach(err => console.error(`   - ${err}`));
    }

    // 2. Check Credit Configuration
    console.log('\n2. Checking Credit Configuration:');
    console.log(`   - Cost per Analysis: ${APP_CONFIG.credits.COST_PER_ANALYSIS}`);
    console.log(`   - Cost per Generation: ${APP_CONFIG.credits.COST_PER_GENERATION}`);
    console.log(`   - Starting Credits: ${APP_CONFIG.credits.STARTING_CREDITS}`);
    
    if (APP_CONFIG.credits.COST_PER_ANALYSIS > 0) {
      console.log('✅ Credit costs are configured correctly');
    } else {
      console.warn('⚠️  Credit costs are 0 (Free mode)');
    }

    // 3. Check AI Configuration
    console.log('\n3. Checking AI Configuration:');
    console.log(`   - Analysis Timeout: ${APP_CONFIG.ai.ANALYSIS_TIMEOUT_MS}ms`);
    console.log(`   - Generation Timeout: ${APP_CONFIG.ai.GENERATION_TIMEOUT_MS}ms`);

    // 4. Check Rate Limiting
    console.log('\n4. Checking Rate Limiting:');
    console.log(`   - Enabled: ${APP_CONFIG.rateLimit.ENABLED}`);
    console.log(`   - Max Requests: ${APP_CONFIG.rateLimit.MAX_REQUESTS_PER_WINDOW}`);

    console.log('\n----------------------------------------');
    console.log('TEST SUMMARY');
    console.log('----------------------------------------');
    
    if (validation.valid) {
      console.log('✅ Configuration Test PASSED');
      // Do not exit here if running as part of suite
    } else {
      console.error('❌ Configuration Test FAILED');
      throw new Error('Configuration Test Failed');
    }
  } catch (error) {
    console.error('❌ Error running tests:', error);
    throw error;
  }
}

// Allow running directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runAsesorEstiloConfigTest().then(() => process.exit(0)).catch(() => process.exit(1));
}
