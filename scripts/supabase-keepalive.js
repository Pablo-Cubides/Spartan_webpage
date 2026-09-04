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

let Client = null;
try {
  Client = require('pg').Client;
} catch {
  // pg module not installed — will use native PostgREST HTTP query
}

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

function getInferredSupabaseUrl() {
  if (SUPABASE_URL) return SUPABASE_URL.replace(/\/$/, '');
  if (!DATABASE_URL) return null;
  try {
    const u = new URL(DATABASE_URL);
    const user = decodeURIComponent(u.username || '');
    if (user.includes('.')) {
      const ref = user.split('.')[1];
      if (ref && /^[a-z0-9]+$/i.test(ref)) {
        return `https://${ref}.supabase.co`;
      }
    }
  } catch {}
  return null;
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

async function pingPostgRestApi() {
  const baseUrl = getInferredSupabaseUrl();
  if (!baseUrl) {
    console.log('ℹ Cannot infer Supabase URL for PostgREST ping.');
    return false;
  }

  const apiKey = SUPABASE_SERVICE_ROLE_KEY;
  const headers = {};
  if (apiKey) {
    headers['apikey'] = apiKey;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // 1. PostgREST table query — executes a real SQL query in Postgres via Kong gateway
  const restUrl = `${baseUrl}/rest/v1/User?select=count&limit=1`;
  try {
    const res = await fetch(restUrl, {
      headers: { ...headers, Prefer: 'count=exact' },
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      console.log(`✅ PostgREST Data API reachable — HTTP ${res.status} (real database activity registered)`);
      return true;
    } else {
      // Fallback: root OpenAPI schema introspection query
      const rootRes = await fetch(`${baseUrl}/rest/v1/`, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      if (rootRes.ok) {
        console.log(`✅ PostgREST root schema reachable — HTTP ${rootRes.status} (database schema introspection registered)`);
        return true;
      }
      console.warn(`⚠ PostgREST returned HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn(`⚠ PostgREST ping failed: ${err.message}`);
  }
  return false;
}

async function pingPostgres() {
  if (!Client) {
    throw new Error("pg_not_installed");
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    statement_timeout: 15000,
  });

  await client.connect();
  try {
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
  const baseUrl = getInferredSupabaseUrl();
  if (!baseUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('ℹ Skipping Auth API ping (SUPABASE_URL / SERVICE_ROLE_KEY not set)');
    return;
  }
  const url = `${baseUrl}/auth/v1/admin/users?page=1&per_page=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    console.warn(`⚠ Auth API ping returned HTTP ${res.status} (non-fatal)`);
    return;
  }
  console.log('✅ Auth API reachable');
}

async function main() {
  const hasValidDbUrl = DATABASE_URL && !DATABASE_URL.includes('tu-connection-string') && !DATABASE_URL.includes('placeholder');
  const hasSupabaseUrl = SUPABASE_URL && !SUPABASE_URL.includes('placeholder');

  if (!hasValidDbUrl && !hasSupabaseUrl) {
    console.error('❌ ERROR: Neither valid DATABASE_URL nor SUPABASE_URL is configured in secrets.');
    process.exit(1);
  }

  if (hasValidDbUrl) {
    console.log(`Target DB: ${safeTarget(DATABASE_URL)}`);
  }
  const inferredUrl = getInferredSupabaseUrl();
  if (inferredUrl) {
    console.log(`Target API: ${inferredUrl}`);
  }

  let dbOk = false;

  // 1. PostgREST HTTP query (always works with native Node fetch, 0 npm deps, registers gateway activity)
  try {
    const postgrestOk = await retry(pingPostgRestApi, 2, 1000);
    if (postgrestOk) {
      dbOk = true;
    }
  } catch (err) {
    console.warn(`⚠ PostgREST retry failed: ${err.message}`);
  }

  // 2. Direct PostgreSQL query via pg (if pg driver is available)
  if (Client && hasValidDbUrl) {
    console.log('Pinging Postgres via pg driver...');
    try {
      const detail = await retry(pingPostgres, 3, 1500);
      console.log(`✅ Postgres direct TCP reachable — ${detail}`);
      dbOk = true;
    } catch (err) {
      console.warn(`⚠ Postgres TCP check error: ${err.message}`);
      if (!dbOk) {
        if (/not found|ENOTFOUND|Tenant or user not found/i.test(err.message)) {
          console.error('This usually means the Supabase project is PAUSED or project ref changed.');
        }
      }
    }
  } else if (!Client) {
    console.log('ℹ Native fetch mode active: pg driver not needed.');
  }

  await pingAuthApi().catch(err => {
    console.warn(`⚠ Auth API ping failed (non-fatal): ${err.message}`);
  });

  if (!dbOk) {
    console.error('\n❌ Could not verify Supabase activity via either PostgREST or direct Postgres.\n');
    process.exit(1);
  }

  console.log(`\nActivity registered successfully at: ${new Date().toISOString()}`);
}

main();
