#!/usr/bin/env node
/**
 * supabase-keepalive.js
 *
 * Keeps the Supabase project from being auto-paused for inactivity, and — more
 * importantly — verifies that the POSTGRES database is actually reachable.
 *
 * History / why this exists in this shape:
 *   The original keep-alive only called the Supabase Auth Admin API. That call
 *   succeeds even when the Postgres instance is paused or DATABASE_URL points at
 *   a project ref that no longer exists, so the workflow reported green while
 *   production was returning:
 *       (ENOTFOUND) tenant/user postgres.<ref> not found
 *   Auth API traffic also does not count as database activity, so it never
 *   prevented the pause it was supposed to prevent.
 *
 * This script therefore does BOTH:
 *   1. A real SQL round-trip against DATABASE_URL (the actual keep-alive)
 *   2. An optional Auth Admin API ping (cheap extra signal)
 *
 * Exit codes:
 *   0 — Postgres reachable
 *   1 — Postgres unreachable / misconfigured (fail loudly, do not mask)
 *
 * Env:
 *   DATABASE_URL                 Required. Pooler connection string.
 *   SUPABASE_URL                 Optional. Enables the Auth API ping.
 *   SUPABASE_SERVICE_ROLE_KEY    Optional. Required if SUPABASE_URL is set.
 */

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Redact credentials so we can log the target without leaking the password. */
function safeTarget(connectionString) {
  try {
    const u = new URL(connectionString);
    return `${u.hostname}:${u.port || 5432}${u.pathname} (user: ${decodeURIComponent(u.username || 'unknown')})`;
  } catch {
    return '<unparseable DATABASE_URL>';
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry(fn, attempts = 3, baseDelayMs = 1500) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        const wait = baseDelayMs * Math.pow(2, i);
        console.warn(`⚠ Attempt ${i + 1}/${attempts} failed: ${err.message}`);
        console.warn(`  Retrying in ${wait}ms...`);
        await sleep(wait);
      }
    }
  }
  throw lastError;
}

async function pingPostgres() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    statement_timeout: 15000,
  });

  await client.connect();
  try {
    // Touch a real table so the activity is unambiguous, but fall back to a
    // trivial query if the schema isn't there (fresh project, migrations pending).
    let rows;
    try {
      const res = await client.query('SELECT COUNT(*)::int AS n FROM "User"');
      rows = `User rows: ${res.rows[0].n}`;
    } catch {
      const res = await client.query('SELECT NOW() AS now');
      rows = `server time: ${res.rows[0].now.toISOString()} (User table not found — migrations may be pending)`;
    }
    return rows;
  } finally {
    await client.end().catch(() => {});
  }
}

async function pingAuthApi() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('ℹ Skipping Auth API ping (SUPABASE_URL / SERVICE_ROLE_KEY not set)');
    return;
  }
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?page=1&per_page=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    // Non-fatal: Postgres is the source of truth for this check.
    console.warn(`⚠ Auth API ping returned HTTP ${res.status} (non-fatal)`);
    return;
  }
  console.log('✅ Auth API reachable');
}

async function main() {
  if (!DATABASE_URL || DATABASE_URL.includes('tu-connection-string') || DATABASE_URL.includes('placeholder')) {
    console.log('ℹ DATABASE_URL is placeholder or missing. Skipping keep-alive (secrets not configured).');
    process.exit(0);
  }

  console.log(`Target: ${safeTarget(DATABASE_URL)}`);
  console.log('Pinging Postgres...');

  try {
    const detail = await retry(pingPostgres);
    console.log(`✅ Postgres reachable — ${detail}`);
  } catch (err) {
    console.error(`\n❌ Postgres UNREACHABLE: ${err.message}\n`);
    if (/not found|ENOTFOUND|Tenant or user not found/i.test(err.message)) {
      console.error('This usually means one of:');
      console.error('  1. The Supabase project is PAUSED — restore it at');
      console.error('     https://supabase.com/dashboard (Project → Restore)');
      console.error('  2. The project was restored under a NEW project ref, so the');
      console.error('     DATABASE_URL secret is stale — copy the new pooler URL from');
      console.error('     Supabase → Project Settings → Database → Connection pooling');
      console.error('     and update it in BOTH Vercel and GitHub Actions secrets.');
    }
    process.exit(1);
  }

  await pingAuthApi().catch(err => {
    console.warn(`⚠ Auth API ping failed (non-fatal): ${err.message}`);
  });

  console.log(`\nActivity registered at: ${new Date().toISOString()}`);
}

main();
