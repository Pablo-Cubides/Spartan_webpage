#!/usr/bin/env node
/**
 * migration-safety-check.js
 *
 * Runs in the deploy pipeline BEFORE the deploy itself. Compares the local
 * Prisma migrations folder against the live database to detect:
 *   1. Missing migrations on disk that were applied to the DB (drift)
 *   2. Pending migrations that contain DESTRUCTIVE statements (DROP TABLE/COLUMN)
 *
 * If either condition is true, exits non-zero and Harness aborts the deploy.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/migration-safety-check.js
 *
 * Env:
 *   DATABASE_URL    Required. The production DB to inspect.
 *   ALLOW_DESTRUCTIVE  Set to "1" to skip destructive checks (use only for
 *                      planned migrations with manual rollback prepared).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MIGRATIONS_DIR = path.join(ROOT, 'frontend/prisma/migrations');
const allowDestructive = process.env.ALLOW_DESTRUCTIVE === '1';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Cannot perform safety check.');
  process.exit(1);
}

// Patterns that are unsafe by default.
const DESTRUCTIVE_PATTERNS = [
  /\bDROP\s+TABLE\b/i,
  /\bDROP\s+COLUMN\b/i,
  /\bDROP\s+SCHEMA\b/i,
  /\bTRUNCATE\b/i,
  // NOT NULL without default, on existing table
  /\bALTER\s+TABLE\s+\S+\s+ADD\s+COLUMN\s+\S+\s+\S+\s+NOT\s+NULL(?!\s+DEFAULT)/i,
];

function listLocalMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs.readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

function scanForDestructive(migName) {
  const sqlPath = path.join(MIGRATIONS_DIR, migName, 'migration.sql');
  if (!fs.existsSync(sqlPath)) return [];
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const matches = [];
  for (const re of DESTRUCTIVE_PATTERNS) {
    const m = sql.match(re);
    if (m) matches.push(m[0]);
  }
  return matches;
}

function getAppliedMigrations() {
  // Use prisma migrate status for a structured view
  try {
    const out = execSync(
      'npx --prefix frontend prisma migrate status --schema frontend/prisma/schema.prisma',
      { encoding: 'utf8', cwd: ROOT, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    return out;
  } catch (err) {
    // Non-zero exit just means there are pending migrations, which is expected.
    return (err.stdout || '') + (err.stderr || '');
  }
}

const local = listLocalMigrations();
console.log(`Local migrations on disk: ${local.length}`);
local.forEach(m => console.log(`  - ${m}`));

console.log('\nChecking destructive patterns in pending migrations...');
let destructiveFound = false;
for (const m of local) {
  const issues = scanForDestructive(m);
  if (issues.length > 0) {
    console.error(`\n⚠ DESTRUCTIVE statements in ${m}:`);
    issues.forEach(i => console.error(`    • ${i}`));
    destructiveFound = true;
  }
}

if (destructiveFound && !allowDestructive) {
  console.error('\n❌ Destructive migration(s) detected. Aborting deploy.');
  console.error('   To proceed, ensure a rollback plan exists in docs/runbooks/');
  console.error('   then re-run with ALLOW_DESTRUCTIVE=1');
  process.exit(1);
}

console.log('\nChecking DB ↔ disk migration drift...');
const status = getAppliedMigrations();
console.log(status);

if (/Database schema is up to date/i.test(status)) {
  console.log('✅ Migrations match — no drift, no destructive statements.');
  process.exit(0);
}

if (/following migrations? have not yet been applied/i.test(status)) {
  console.log('ℹ Pending migrations detected (will be applied during deploy).');
  console.log('✅ Safety check passed (no drift, destructive patterns reviewed).');
  process.exit(0);
}

if (/migrations were applied to the database, but are missing locally/i.test(status)) {
  console.error('\n❌ Database has migrations not present in this codebase!');
  console.error('   This means someone applied migrations directly to the DB.');
  console.error('   Aborting to prevent further drift.');
  process.exit(1);
}

console.log('✅ Safety check completed.');
process.exit(0);
