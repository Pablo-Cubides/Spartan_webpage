#!/usr/bin/env node
/**
 * qa-spec-verifier.js
 *
 * Verifies that every Acceptance Criterion in a spec.md has a link to a test.
 * Expects the format:
 *   - [ ] Criterion description {@test: frontend/tests/path/to/test.ts}
 *
 * Usage: node scripts/qa-spec-verifier.js [--strict]
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const strict = process.argv.includes('--strict');
const SPECS_ROOT = path.join(ROOT, 'docs/specs');

function checkSpec(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const { content } = matter(fileContent);
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  
  const errors = [];
  const warnings = [];
  
  let inAcceptanceCriteria = false;
  let criteriaCount = 0;
  let linkedCriteriaCount = 0;

  for (const line of lines) {
    if (/^##\s+.*acceptance criteria/i.test(line)) {
      inAcceptanceCriteria = true;
      continue;
    }
    if (inAcceptanceCriteria && /^##\s+/.test(line)) {
      inAcceptanceCriteria = false;
    }

    if (inAcceptanceCriteria && /^[-*]\s+(\[ ]|\[x])?\s*(.+)/.test(line)) {
      const criterion = line.trim();
      if (criterion.length < 5) continue; // Skip empty/too short lines
      
      criteriaCount++;
      const testRefMatch = criterion.match(/\{@test:\s*([^\s}]+)\}/);
      
      if (testRefMatch) {
        linkedCriteriaCount++;
        const testPath = testRefMatch[1];
        if (!fs.existsSync(path.join(ROOT, testPath))) {
          errors.push(`Criterion links to non-existent test file: ${testPath}`);
        }
      } else {
        const msg = `Criterion missing test reference: "${criterion.substring(0, 40)}..."`;
        if (strict) errors.push(msg);
        else warnings.push(msg);
      }
    }
  }

  return { errors, warnings, criteriaCount, linkedCriteriaCount };
}

function findSpecs() {
  const specs = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'templates' || entry.name === 'api-contracts') continue;
        walk(full);
      } else if (entry.isFile() && entry.name === 'spec.md') {
        specs.push(path.relative(ROOT, full));
      }
    }
  }

  walk(SPECS_ROOT);
  return specs.sort();
}

const specs = findSpecs();
let failed = false;
const allErrors = [];
const allWarnings = [];

console.log('🔍 Verifying spec-to-test traceability...\n');

for (const spec of specs) {
  try {
    const { errors, warnings, criteriaCount, linkedCriteriaCount } = checkSpec(spec);
    if (errors.length > 0) {
      allErrors.push({ spec, errors });
      failed = true;
    }
    if (warnings.length > 0) {
      allWarnings.push({ spec, warnings });
    }
    console.log(`  ${spec}: ${linkedCriteriaCount}/${criteriaCount} criteria linked to tests.`);
  } catch (err) {
    allErrors.push({ spec, errors: [`Parse error: ${err.message}`] });
    failed = true;
  }
}

if (allWarnings.length > 0) {
  console.warn('\n⚠ Traceability warnings (criteria without tests):\n');
  for (const { spec, warnings } of allWarnings) {
    console.warn(`  ${spec}:`);
    warnings.forEach(w => console.warn(`    • ${w}`));
  }
}

if (allErrors.length > 0) {
  console.error('\n❌ Traceability check FAILED — broken test references:\n');
  for (const { spec, errors } of allErrors) {
    console.error(`  ${spec}:`);
    errors.forEach(e => console.error(`    • ${e}`));
  }
}

if (!failed) {
  console.log('\n✅ Spec traceability OK — all criteria with references are valid.');
  process.exit(0);
}

if (strict) {
  process.exit(1);
}

console.warn('\n⚠ Continuing because --strict not set.');
process.exit(0);
