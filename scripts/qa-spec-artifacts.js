#!/usr/bin/env node
/**
 * qa-spec-artifacts.js
 *
 * Verifies that every feature spec directory carries the SDD artifact set:
 * spec.md, plan.md, tasks.md, test-scenarios.md, and rollout.md for high-risk specs.
 *
 * Usage: node scripts/qa-spec-artifacts.js [--strict]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SPECS_ROOT = path.join(ROOT, 'docs/specs');
const strict = process.argv.includes('--strict');

const REQUIRED = ['spec.md', 'plan.md', 'tasks.md', 'test-scenarios.md'];
const HIGH_RISK_RE = /(deploy|deployment|release|rollback|pagos|payment|stripe|mercadopago|\bauth\b|authentication|authorization|database|migration|prisma|coach|\bIA\b|\bAI\b)/i;

function findSpecDirs() {
  const dirs = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;
      if (entry.name === 'templates' || entry.name === 'api-contracts') continue;
      if (fs.existsSync(path.join(full, 'spec.md'))) dirs.push(full);
      walk(full);
    }
  }

  walk(SPECS_ROOT);
  return dirs.sort();
}

function needsRollout(dir) {
  const rel = path.relative(ROOT, dir).replace(/\\/g, '/');
  const spec = fs.readFileSync(path.join(dir, 'spec.md'), 'utf8');
  return HIGH_RISK_RE.test(`${rel}\n${spec}`);
}

let failed = false;
const errors = [];

for (const dir of findSpecDirs()) {
  const rel = path.relative(ROOT, dir).replace(/\\/g, '/');
  for (const artifact of REQUIRED) {
    if (!fs.existsSync(path.join(dir, artifact))) {
      errors.push(`${rel}: missing ${artifact}`);
      failed = true;
    }
  }

  if (needsRollout(dir) && !fs.existsSync(path.join(dir, 'rollout.md'))) {
    errors.push(`${rel}: missing rollout.md for high-risk feature`);
    failed = true;
  }
}

if (errors.length > 0) {
  console.error('\n❌ Spec artifact check FAILED:\n');
  errors.forEach(e => console.error(`   • ${e}`));
  console.error('\nFix: add the missing SDD artifact files from docs/specs/templates/.\n');
}

if (!failed) {
  console.log(`✅ Spec artifacts OK — ${findSpecDirs().length} feature spec directories checked.`);
  process.exit(0);
}

if (strict) process.exit(1);

console.warn('⚠ Continuing because --strict not set.');
process.exit(0);
