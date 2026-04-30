#!/usr/bin/env node
/**
 * qa-spec-completeness.js
 *
 * Verifies every API route has a contract document in the MANIFEST.
 * Fails if:
 *   1. A route.ts exists with no entry in MANIFEST.json
 *   2. A MANIFEST entry points to a contract file that doesn't exist on disk
 *
 * Usage: node scripts/qa-spec-completeness.js [--strict]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ROUTES_DIR = path.join(ROOT, 'frontend/src/app/api');
const MANIFEST_PATH = path.join(ROOT, 'docs/specs/api-contracts/MANIFEST.json');
const strict = process.argv.includes('--strict');

function discoverRoutes(dir, base = '/api') {
  const routes = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      routes.push(...discoverRoutes(full, `${base}/${entry.name}`));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      routes.push(base);
    }
  }
  return routes;
}

function normalizeRoute(route) {
  // Normalize dynamic segments: [id] stays as-is for MANIFEST matching
  return route.replace(/\\/g, '/');
}

let failed = false;
const errors = [];
const warnings = [];

// Load manifest
if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`❌ MANIFEST not found: ${MANIFEST_PATH}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const manifestRoutes = manifest.routes || {};

// 1. Check all discovered routes are in the manifest
const discoveredRoutes = discoverRoutes(ROUTES_DIR);
for (const route of discoveredRoutes) {
  const normalized = normalizeRoute(route);
  if (!manifestRoutes[normalized]) {
    errors.push(`Route not in MANIFEST: ${normalized}`);
    failed = true;
  }
}

// 2. Check all manifest contract files exist on disk
const seenContracts = new Set();
for (const [route, contractPath] of Object.entries(manifestRoutes)) {
  const fullPath = path.join(ROOT, contractPath);
  if (!seenContracts.has(contractPath)) {
    seenContracts.add(contractPath);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Contract file missing for route "${route}": ${contractPath}`);
      failed = true;
    }
  }
}

// Report
if (errors.length > 0) {
  console.error('\n❌ Spec completeness check FAILED:\n');
  errors.forEach(e => console.error(`   • ${e}`));
  console.error('\nFix: add the route to MANIFEST.json and create the contract file.');
  console.error('Template: docs/specs/templates/contracts.template.md\n');
}

if (warnings.length > 0) {
  warnings.forEach(w => console.warn(`   ⚠ ${w}`));
}

if (!failed) {
  console.log(`✅ Spec completeness OK — ${discoveredRoutes.length} routes, all covered.`);
  process.exit(0);
}

if (strict) {
  process.exit(1);
}

console.warn('⚠ Continuing because --strict not set.');
process.exit(0);
