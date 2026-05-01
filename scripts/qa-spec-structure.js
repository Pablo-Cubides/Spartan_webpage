#!/usr/bin/env node
/**
 * qa-spec-structure.js
 *
 * Validates that every spec.md file has the required sections.
 * Required sections: Problem, Goal, Acceptance Criteria, Definition of Done
 * Recommended sections (warn only): Scope, Implementation, Test Scenarios
 *
 * Usage: node scripts/qa-spec-structure.js [--strict]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const strict = process.argv.includes('--strict');

const SPEC_DIRS = [
  'docs/specs/001-blog-media-upload',
  'docs/specs/pagos',
  'docs/specs/ia-tools',
  'docs/specs/auth-admin',
  'docs/specs/blog-publish',
];

// Sections that MUST be present (case-insensitive heading match)
const REQUIRED_SECTIONS = [
  /^##\s+problem/i,
  /^##\s+goal/i,
  /^##\s+.*acceptance criteria/i,
  /^##\s+definition of done/i,
];

const REQUIRED_LABELS = [
  'Problem',
  'Goal',
  'Acceptance Criteria',
  'Definition of Done',
];

// Sections that are recommended but not required
const RECOMMENDED_SECTIONS = [
  { re: /^##\s+scope/i, label: 'Scope' },
  { re: /^##\s+(implementation|impl)/i, label: 'Implementation' },
  { re: /^##\s+test scenarios/i, label: 'Test Scenarios' },
];

// Frontmatter fields required
const REQUIRED_FRONTMATTER = ['version', 'status', 'owner'];

function parseFrontmatter(content) {
  // Support both LF and CRLF line endings
  const normalized = content.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*"?([^"]+)"?/);
    if (m) fields[m[1].trim()] = m[2].trim();
  }
  return fields;
}

function checkSpec(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const errors = [];
  const warnings = [];

  // Frontmatter check
  const fm = parseFrontmatter(content);
  if (!fm) {
    errors.push('Missing YAML frontmatter (---version/status/owner---');
  } else {
    for (const field of REQUIRED_FRONTMATTER) {
      if (!fm[field]) errors.push(`Frontmatter missing field: ${field}`);
    }
  }

  // Required sections
  for (let i = 0; i < REQUIRED_SECTIONS.length; i++) {
    const re = REQUIRED_SECTIONS[i];
    const found = lines.some(l => re.test(l));
    if (!found) {
      errors.push(`Missing required section: ## ${REQUIRED_LABELS[i]}`);
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
  for (const dir of SPEC_DIRS) {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;
    for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name === 'spec.md') {
        specs.push(path.join(dir, entry.name));
      }
    }
  }
  return specs;
}

const specs = findSpecs();
let failed = false;
const allErrors = [];
const allWarnings = [];

for (const spec of specs) {
  const { errors, warnings } = checkSpec(spec);
  if (errors.length > 0) {
    allErrors.push({ spec, errors });
    failed = true;
  }
  if (warnings.length > 0) {
    allWarnings.push({ spec, warnings });
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
  console.error('\n❌ Spec structure check FAILED — required sections missing:\n');
  for (const { spec, errors } of allErrors) {
    console.error(`  ${spec}:`);
    errors.forEach(e => console.error(`    • ${e}`));
  }
  console.error('\nFix: add the missing sections. See docs/specs/templates/spec.template.md\n');
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
