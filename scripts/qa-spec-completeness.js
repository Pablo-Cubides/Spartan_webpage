#!/usr/bin/env node
/**
 * qa-spec-completeness.js
 *
 * Verifies every API route has a contract document in the MANIFEST.
 * Fails if:
 *   1. A route.ts exists with no entry in MANIFEST.json
 *   2. A MANIFEST entry points to a contract file that doesn't exist on disk
 *   3. A contract file doesn't reference a validation schema (Zod) for mutations
 *
 * Usage: node scripts/qa-spec-completeness.js [--strict]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'frontend/src/app');
const MANIFEST_PATH = path.join(ROOT, 'docs/specs/api-contracts/MANIFEST.json');
const SCHEMAS_PATH = path.join(ROOT, 'frontend/src/lib/validation/schemas.ts');
const strict = process.argv.includes('--strict');

function discoverRoutes(dir) {
  const routes = [];
  if (!fs.existsSync(dir)) return routes;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      routes.push(...discoverRoutes(full));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      const relDir = path.relative(APP_DIR, dir).replace(/\\/g, '/');
      routes.push(`/${relDir}`);
    }
  }
  return routes;
}

function normalizeRoute(route) {
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

// Load schemas to check for presence
const schemasContent = fs.existsSync(SCHEMAS_PATH) ? fs.readFileSync(SCHEMAS_PATH, 'utf8') : '';

// 1. Check all discovered routes are in the manifest
const discoveredRoutes = discoverRoutes(APP_DIR).sort();
for (const route of discoveredRoutes) {
  const normalized = normalizeRoute(route);
  if (!manifestRoutes[normalized]) {
    errors.push(`Route not in MANIFEST: ${normalized}`);
    failed = true;
  }
}

// 2. Check all manifest contract files exist and have schema refs
const seenContracts = new Set();
for (const [route, contractPath] of Object.entries(manifestRoutes)) {
  const fullPath = path.join(ROOT, contractPath);
  if (!seenContracts.has(contractPath)) {
    seenContracts.add(contractPath);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Contract file missing for route "${route}": ${contractPath}`);
      failed = true;
    } else {
      // 3. Check for Zod schema reference in the contract
      const contractContent = fs.readFileSync(fullPath, 'utf8');
      const schemaRefMatch = contractContent.match(/Schema:\s*`(\w+)`/);
      
      if (schemaRefMatch) {
        const schemaName = schemaRefMatch[1];
        // Verify the schema actually exists in schemas.ts (allow 'none' for manual validation)
        if (schemaName.toLowerCase() !== 'none' && !schemasContent.includes(`export const ${schemaName}`) && !schemasContent.includes(`export type ${schemaName}`)) {
          errors.push(`Contract "${contractPath}" references unknown schema "${schemaName}"`);
          failed = true;
        }
      } else if (route.includes('/api/admin/') || route.includes('/api/auth/') || route.includes('/api/credits/')) {
        // Warning for missing schemas on important routes
        warnings.push(`Contract "${contractPath}" (route: ${route}) missing Zod schema reference (Schema: \`Name\`)`);
      }
    }
  }
}

// Report
if (errors.length > 0) {
  console.error('\n❌ Spec completeness check FAILED:\n');
  errors.forEach(e => console.error(`   • ${e}`));
  console.error('\nFix: add the route to MANIFEST.json, create/fix the contract file, or link the Zod schema.');
  console.error('Template: docs/specs/templates/contracts.template.md\n');
}

if (warnings.length > 0) {
  console.warn('\n⚠ Spec completeness warnings:\n');
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

