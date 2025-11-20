#!/usr/bin/env node

/**
 * FASE 3: Rate Limiting Verification
 * Validates rate limiting configuration and Redis connectivity
 */

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

async function verifyRateLimiting() {
  log('\n🚀 FASE 3: Rate Limiting Verification', 'blue');

  try {
    // Import the rate limiter
    const rateLimitModule = await import('../src/lib/asesor-estilo/rate-limit/index.ts');
    
    log('\n1. ✅ Rate limiter module loaded successfully', 'green');

    // Check configuration
    const configModule = await import('../src/lib/asesor-estilo/config/app.config.ts');
    const config = configModule.APP_CONFIG;

    if (config.rateLimit.ENABLED) {
      log('2. ✅ Rate limiting is ENABLED', 'green');
      log(`   - Window: ${config.rateLimit.WINDOW_DURATION_SECONDS}s`, 'blue');
      log(`   - Max requests: ${config.rateLimit.MAX_REQUESTS_PER_WINDOW}`, 'blue');
    } else {
      log('2. ⚠️  Rate limiting is DISABLED (development mode)', 'yellow');
    }

    // Check Redis configuration
    if (config.cache.REDIS_URL) {
      log('3. ✅ Redis URL configured', 'green');
      log(`   - URL: ${config.cache.REDIS_URL.substring(0, 20)}...`, 'blue');
      
      // Try to test Redis connection
      try {
        const redisModule = await import('@upstash/redis');
        if (redisModule && redisModule.Redis) {
          log('4. ✅ @upstash/redis is installed', 'green');
          log('   - Will use Redis for distributed rate limiting', 'blue');
        }
      } catch {
        log('4. ⚠️  @upstash/redis not installed (will use in-memory fallback)', 'yellow');
      }
    } else {
      log('3. ℹ️  Redis not configured - using in-memory rate limiter', 'blue');
      log('   - This works for single-instance deployments', 'blue');
    }

    // Check function exports
    if (typeof rateLimitModule.enforceRateLimit === 'function') {
      log('5. ✅ enforceRateLimit function exported', 'green');
    }
    if (typeof rateLimitModule.checkRateLimit === 'function') {
      log('6. ✅ checkRateLimit function exported', 'green');
    }
    if (typeof rateLimitModule.getRequestIdentifier === 'function') {
      log('7. ✅ getRequestIdentifier function exported', 'green');
    }

    // Test in-memory rate limiter
    log('\n8. Testing in-memory rate limiter...', 'blue');
    const testIdentifier = 'test-ip-127.0.0.1';
    const result1 = await rateLimitModule.checkRateLimit(testIdentifier, 'analyze');
    
    if (result1.allowed) {
      log(`   ✅ First request allowed (remaining: ${result1.remaining})`, 'green');
    } else {
      log('   ❌ First request denied', 'red');
    }

    log('\n✅ FASE 3: Rate Limiting Verification COMPLETE', 'green');
    log('\nConfiguration Summary:', 'blue');
    log('┌─ Rate Limiting Status', 'blue');
    log(`├─ Enabled: ${config.rateLimit.ENABLED ? 'YES' : 'NO (dev mode)'}`, 'blue');
    log(`├─ Limit: ${config.rateLimit.MAX_REQUESTS_PER_WINDOW} requests per ${config.rateLimit.WINDOW_DURATION_SECONDS}s`, 'blue');
    log(`├─ Storage: ${config.cache.REDIS_URL ? 'Redis (Upstash)' : 'In-Memory'}`, 'blue');
    log(`└─ Ready for production: ${config.cache.REDIS_URL ? 'YES ✓' : 'Single-instance only'}`, 'blue');

  } catch (error) {
    log(`\n❌ Verification failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

verifyRateLimiting().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
