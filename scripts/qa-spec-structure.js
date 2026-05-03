#!/usr/bin/env node
/**
 * qa-spec-structure.js
 *
 * Validates that every spec.md file has the required sections.
 * Required sections: Problem, Goal, Scope, Constraints, Acceptance Criteria, Definition of Done
 * Recommended sections (warn only): Implementation, Test Scenarios
 *
 * Usage: node scripts/qa-spec-structure.js [--strict]
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const strict = process.argv.includes('--strict');
const SPECS_ROOT = path.join(ROOT, 'docs/specs');

// Sections that MUST be present (case-insensitive heading match)
const REQUIRED_SECTIONS = [
  { re: /^##\s+problem/i, label: 'Problem' },
  { re: /^##\s+goal/i, label: 'Goal' },
  { re: /^##\s+scope/i, label: 'Scope' },
  { re: /^##\s+constraints/i, label: 'Constraints' },
  { re: /^##\s+.*acceptance criteria/i, label: 'Acceptance Criteria' },
  { re: /^##\s+definition of done/i, label: 'Definition of Done' },
];

// Sections that are recommended but not required
const RECOMMENDED_SECTIONS = [
  { re: /^##\s+(implementation|impl)/i, label: 'Implementation' },
  { re: /^##\s+test scenarios/i, label: 'Test Scenarios' },
];

// Frontmatter fields required
const REQUIRED_FRONTMATTER = ['version', 'status', 'owner'];

function checkSpec(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const { data: fm, content } = matter(fileContent);
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const errors = [];
  const warnings = [];

  // Frontmatter check
  if (!Object.keys(fm).length) {
    errors.push('Missing or empty YAML frontmatter (---version/status/owner---)');
  } else {
    for (const field of REQUIRED_FRONTMATTER) {
      if (!fm[field]) errors.push(`Frontmatter missing field: ${field}`);
    }
  }

  // Required sections
  for (const { re, label } of REQUIRED_SECTIONS) {
    const found = lines.some(l => re.test(l));
    if (!found) {
      errors.push(`Missing required section: ## ${label}`);
    }
  }

  // Recommended sections
  for (const { re, label } of RECOMMENDED_SECTIONS) {
    const found = lines.some(l => re.test(l));
    if (!found) {
      warnings.push(`Missing recommended section: ## ${label}`);
    }
  }

  return { errors, warnings };
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

for (const spec of specs) {
  try {
    const { errors, warnings } = checkSpec(spec);
    if (errors.length > 0) {
      allErrors.push({ spec, errors });
      failed = true;
    }
    if (warnings.length > 0) {
      allWarnings.push({ spec, warnings });
    }
  } catch (err) {
    allErrors.push({ spec, errors: [`Parse error: ${err.message}`] });
    failed = true;
  }
}

if (allWarnings.length > 0) {
  console.warn('\n⚠ Spec structure warnings:\n');
  for (const { spec, warnings } of allWarnings) {
    console.warn(`  ${spec}:`);
    warnings.forEach(w => console.warn(`    • ${w}`));
  }
}

if (allErrors.length > 0) {
  console.error('\n❌ Spec structure check FAILED — required sections missing or invalid frontmatter:\n');
  for (const { spec, errors } of allErrors) {
    console.error(`  ${spec}:`);
    errors.forEach(e => console.error(`    • ${e}`));
  }
  console.error('\nFix: add the missing sections or fix frontmatter. See docs/specs/templates/spec.template.md\n');
}

if (!failed) {
  console.log(`✅ Spec structure OK — ${specs.length} specs checked, all required sections present.`);
  process.exit(0);
}

if (strict) {
  process.exit(1);
}

console.warn('⚠ Continuing because --strict not set.');
process.exit(0);

