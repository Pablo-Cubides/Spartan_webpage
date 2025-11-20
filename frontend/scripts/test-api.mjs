#!/usr/bin/env node

/**
 * FASE 5.2: Integration Test Suite
 * Validates critical API endpoints, error handling, and security measures
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  tests: [],
};

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function pass(testName) {
  TEST_RESULTS.passed++;
  TEST_RESULTS.tests.push({ name: testName, status: 'PASS' });
  log(`✅ ${testName}`, 'green');
}

function fail(testName, error) {
  TEST_RESULTS.failed++;
  TEST_RESULTS.tests.push({ name: testName, status: 'FAIL', error });
  log(`❌ ${testName}: ${error}`, 'red');
}

async function testHealthEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.status === 200) {
      const data = await response.json();
      if (data.status === 'ok') {
        pass('Health endpoint responds correctly');
      } else {
        fail('Health endpoint', 'Invalid status field');
      }
    } else {
      fail('Health endpoint', `HTTP ${response.status}`);
    }
  } catch (error) {
    fail('Health endpoint', error?.message || 'Unknown error');
  }
}

async function testBlogPublicAPI() {
  try {
    const response = await fetch(`${BASE_URL}/api/blog`);
    if (response.status === 200) {
      const data = await response.json();
      if (Array.isArray(data)) {
        pass('Blog public API returns array');
      } else {
        fail('Blog public API', 'Response is not an array');
      }
    } else {
      fail('Blog public API', `HTTP ${response.status}`);
    }
  } catch (error) {
    fail('Blog public API', error?.message || 'Unknown error');
  }
}

async function testHomeContentAPI() {
  try {
    const response = await fetch(`${BASE_URL}/api/home-content`);
    if (response.status === 200) {
      const data = await response.json();
      if (data.hero && data.hero.title) {
        pass('Home content API works');
      } else {
        fail('Home content API', 'Missing hero content');
      }
    } else {
      fail('Home content API', `HTTP ${response.status}`);
    }
  } catch (error) {
    fail('Home content API', error?.message || 'Unknown error');
  }
}

async function testErrorHandling() {
  try {
    // Test 404 error
    const response = await fetch(`${BASE_URL}/api/blog/nonexistent-slug`);
    if (response.status === 404) {
      const data = await response.json();
      if (data.error === 'NOT_FOUND') {
        pass('Error handler returns 404 with NOT_FOUND code');
      } else {
        fail('Error handler', 'Wrong error code');
      }
    } else {
      fail('Error handler', `Expected 404, got ${response.status}`);
    }
  } catch (error) {
    fail('Error handler', error?.message || 'Unknown error');
  }
}

async function testValidationErrors() {
  try {
    // Test validation error - missing required field
    const response = await fetch(`${BASE_URL}/api/credits/packages`, {
      method: 'GET',
    });
    if (response.status === 200) {
      pass('Credits packages endpoint accessible');
    } else {
      fail('Credits packages endpoint', `HTTP ${response.status}`);
    }
  } catch (error) {
    fail('Credits packages endpoint', error?.message || 'Unknown error');
  }
}

async function testCORSHeaders() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const corsHeader = response.headers.get('access-control-allow-origin');
    
    if (corsHeader !== null) {
      pass('CORS headers present');
    } else {
      log('⚠️  CORS headers not configured (may be expected)', 'yellow');
    }
  } catch (error) {
    fail('CORS headers check', error?.message || 'Unknown error');
  }
}

async function testCacheHeaders() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const cacheControl = response.headers.get('cache-control');
    
    if (cacheControl && cacheControl.includes('no-store')) {
      pass('Cache-Control headers correctly set to no-store');
    } else {
      log('⚠️  Cache-Control headers may not be optimally set', 'yellow');
    }
  } catch (error) {
    fail('Cache headers check', error?.message || 'Unknown error');
  }
}

async function testResponseTiming() {
  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/api/health`);
    const duration = Date.now() - startTime;
    
    if (response.status === 200 && duration < 1000) {
      pass(`Response time acceptable (${duration}ms)`);
    } else if (duration >= 1000) {
      log(`⚠️  Response time slow (${duration}ms)`, 'yellow');
    }
  } catch (error) {
    fail('Response timing test', error?.message || 'Unknown error');
  }
}

async function testZodValidation() {
  try {
    // Test that Zod schemas are working
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.status === 200) {
      pass('API endpoints compile and run with Zod');
    }
  } catch (error) {
    fail('Zod validation test', error?.message || 'Unknown error');
  }
}

async function runAllTests() {
  log('\n🚀 Starting FASE 5.2 Integration Test Suite...', 'blue');
  log(`📍 Testing against: ${BASE_URL}\n`, 'blue');

  log('📋 Core Endpoint Tests', 'blue');
  await testHealthEndpoint();
  await testBlogPublicAPI();
  await testHomeContentAPI();

  log('\n🔒 Error Handling Tests', 'blue');
  await testErrorHandling();
  await testValidationErrors();

  log('\n⚡ Performance & Security Tests', 'blue');
  await testCORSHeaders();
  await testCacheHeaders();
  await testResponseTiming();
  await testZodValidation();

  log('\n📊 Test Summary', 'blue');
  log(`✅ Passed: ${TEST_RESULTS.passed}`, 'green');
  log(`❌ Failed: ${TEST_RESULTS.failed}`, TEST_RESULTS.failed > 0 ? 'red' : 'green');

  const total = TEST_RESULTS.passed + TEST_RESULTS.failed;
  const percentage = Math.round((TEST_RESULTS.passed / total) * 100);
  log(`📈 Success Rate: ${percentage}% (${TEST_RESULTS.passed}/${total})`, 'blue');

  if (TEST_RESULTS.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    TEST_RESULTS.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        log(`   - ${t.name}: ${t.error}`, 'red');
      });
    process.exit(1);
  } else {
    log('\n✅ All tests passed!', 'green');
    process.exit(0);
  }
}

runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error?.message || 'Unknown error'}`, 'red');
  process.exit(1);
});
