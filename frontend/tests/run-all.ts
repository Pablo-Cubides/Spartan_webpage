
import { runPaymentFlowTest } from './payments/flow.test.js';
import { runSignupBonusTest } from './users/signup-bonus.test.js';
import { runAsesorEstiloConfigTest } from './asesor-estilo/config.test.js';

async function runAllTests() {
  console.log('==================================================');
  console.log('🏃 RUNNING ALL TESTS');
  console.log('==================================================');

  try {
    console.log('\n--- [1/3] Payment Flow Test ---');
    await runPaymentFlowTest();

    console.log('\n--- [2/3] Signup Bonus Test ---');
    await runSignupBonusTest();

    console.log('\n--- [3/3] Asesor Estilo Config Test ---');
    await runAsesorEstiloConfigTest();

    console.log('\n==================================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n==================================================');
    console.error('❌ SOME TESTS FAILED');
    console.error('==================================================');
    console.error(error);
    process.exit(1);
  }
}

runAllTests();
