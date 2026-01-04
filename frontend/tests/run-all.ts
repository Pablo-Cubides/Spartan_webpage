
import dotenv from 'dotenv';
import path from 'path';

// Load environment FIRST, before anything else
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath, override: true });

async function runAllTests() {
  console.log('==================================================');
  console.log('🏃 RUNNING ALL TESTS');
  console.log('==================================================');

  const hasDatabase = !!process.env.DATABASE_URL;
  let passedTests = 0;
  let skippedTests = 0;
  let failedTests = 0;

  try {
    // Test 1: Asesor Estilo Config (no DB required)
    console.log('\n--- [1/3] Asesor Estilo Config Test ---');
    const { runAsesorEstiloConfigTest } = await import('./asesor-estilo/config.test.js');
    await runAsesorEstiloConfigTest();
    passedTests++;

    // Test 2: Payment Flow (requires DB)
    console.log('\n--- [2/3] Payment Flow Test ---');
    if (hasDatabase) {
      const { runPaymentFlowTest } = await import('./payments/flow.test.js');
      await runPaymentFlowTest();
      passedTests++;
    } else {
      console.log('⏭️  SKIPPED: DATABASE_URL not configured');
      skippedTests++;
    }

    // Test 3: Signup Bonus (requires DB)
    console.log('\n--- [3/3] Signup Bonus Test ---');
    if (hasDatabase) {
      const { runSignupBonusTest } = await import('./users/signup-bonus.test.js');
      await runSignupBonusTest();
      passedTests++;
    } else {
      console.log('⏭️  SKIPPED: DATABASE_URL not configured');
      skippedTests++;
    }

    console.log('\n==================================================');
    console.log(`✅ TESTS COMPLETE: ${passedTests} passed, ${skippedTests} skipped, ${failedTests} failed`);
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    failedTests++;
    console.error('\n==================================================');
    console.error(`❌ TESTS FAILED: ${passedTests} passed, ${skippedTests} skipped, ${failedTests} failed`);
    console.error('==================================================');
    console.error(error);
    process.exit(1);
  }
}

runAllTests();
