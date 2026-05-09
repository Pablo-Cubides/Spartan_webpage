#!/usr/bin/env node
/**
 * smoke-tests.js
 *
 * Post-deploy verification — runs against the deployed URL to verify the
 * critical paths still work. Exits non-zero on any failure so Harness can
 * abort the deploy or trigger rollback.
 *
 * Usage:
 *   BASE_URL=https://spartan-club.vercel.app node scripts/smoke-tests.js
 *
 * If BASE_URL is not set, defaults to staging URL.
 */

const BASE_URL = process.env.BASE_URL || 'https://spartan-club-staging.vercel.app';
const TIMEOUT_MS = 10000;
const HEALTH_DB_LATENCY_MAX_MS = 500;

/** Fetch with timeout. */
async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

const checks = [];

function check(name, fn) {
  checks.push({ name, fn });
}

check('Health endpoint returns healthy', async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/health`);
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  if (body.status !== 'healthy') {
    throw new Error(`status="${body.status}", expected "healthy"`);
  }
  if (typeof body.dbLatencyMs === 'number' && body.dbLatencyMs > HEALTH_DB_LATENCY_MAX_MS) {
    throw new Error(`DB latency ${body.dbLatencyMs}ms exceeds ${HEALTH_DB_LATENCY_MAX_MS}ms`);
  }
});

check('Public blog endpoint returns 200 + JSON', async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/blog`);
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`content-type="${ct}", expected application/json`);
  }
  const body = await res.json();
  if (!Array.isArray(body) && !body.posts && !body.data) {
    throw new Error('blog response is not an array or {posts}/{data} shape');
  }
});

check('Auth-protected route correctly rejects anonymous', async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/credits/buy`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  // Expect 401 (no auth) or 400 (bad payload but auth rejected first)
  if (res.status !== 401 && res.status !== 400) {
    throw new Error(`HTTP ${res.status}, expected 401 or 400 for unauthenticated request`);
  }
});

check('Homepage returns 200 with HTML', async () => {
  const res = await fetchWithTimeout(`${BASE_URL}/`);
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
    throw new Error('response is not HTML');
  }
  if (!html.toLowerCase().includes('spartan')) {
    throw new Error('homepage HTML does not contain "spartan"');
  }
});

(async () => {
  console.log(`Running smoke tests against ${BASE_URL}`);
  console.log('---');

  let failed = 0;
  for (const { name, fn } of checks) {
    const start = Date.now();
    try {
      await fn();
      const ms = Date.now() - start;
      console.log(`✅ ${name} (${ms}ms)`);
    } catch (err) {
      const ms = Date.now() - start;
      console.error(`❌ ${name} (${ms}ms) — ${err.message}`);
      failed++;
    }
  }

  console.log('---');
  if (failed > 0) {
    console.error(`\n${failed}/${checks.length} smoke tests failed.`);
    process.exit(1);
  } else {
    console.log(`\nAll ${checks.length} smoke tests passed.`);
    process.exit(0);
  }
})();
