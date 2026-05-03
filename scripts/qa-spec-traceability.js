#!/usr/bin/env node
/**
 * qa-spec-traceability.js
 *
 * Scans all spec/contract/test-scenario docs for file references of the form:
 *   `path/to/file.ts` or `path/to/file.ts:42`
 *
 * Verifies every referenced file exists on disk.
 * Fails if any referenced file is missing (renamed, deleted, or typo in docs).
 *
 * Usage: node scripts/qa-spec-traceability.js [--strict]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const strict = process.argv.includes('--strict');

const SCAN_DIRS = [
  'docs/specs',
  'docs/adr',
];

// Match file references like `frontend/src/app/api/blog/route.ts` or `frontend/src/app/api/blog/route.ts:42`
// Also matches bare paths without backticks when inside table cells
const FILE_REF_RE = /`((?:frontend|scripts|docs)\/[^\s`]+\.(?:ts|tsx|js|md|json|prisma))(?::\d+)?`/g;
const TABLE_REF_RE = /\|(.*?)\|/g;
const PATH_IN_TABLE_RE = /((?:frontend|scripts|docs)\/[^\s|,)]+\.(?:ts|tsx|js|md|json|prisma))(?::\d+)?/g;

function extractReferences(content, filePath) {
  const refs = new Set();

  // Backtick references
  let m;
  while ((m = FILE_REF_RE.exec(content)) !== null) {
    refs.add(m[1]);
  }
  FILE_REF_RE.lastIndex = 0;

  // Table cell references
  while ((m = TABLE_REF_RE.exec(content)) !== null) {
    const cell = m[1];
    let pm;
    while ((pm = PATH_IN_TABLE_RE.exec(cell)) !== null) {
      refs.add(pm[1]);
    }
    PATH_IN_TABLE_RE.lastIndex = 0;
  }
  TABLE_REF_RE.lastIndex = 0;

  return refs;
}

function scanDir(dir) {
  const files = [];
  const fullRoot = path.join(ROOT, dir);
  if (!fs.existsSync(fullRoot)) return files;

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'templates') continue;
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'TUTORIAL-FIRST-SPEC.md') {
        files.push(path.relative(ROOT, full));
      }
    }
  }

  walk(fullRoot);
  return files;
}

let failed = false;
const errors = [];

for (const dir of SCAN_DIRS) {
  for (const relDoc of scanDir(dir)) {
    const content = fs.readFileSync(path.join(ROOT, relDoc), 'utf8');
    const refs = extractReferences(content, relDoc);

    for (const ref of refs) {
      const fullPath = path.join(ROOT, ref);
      if (!fs.existsSync(fullPath)) {
        errors.push({ doc: relDoc, ref });
        failed = true;
      }
    }
  }
}

if (errors.length > 0) {
  console.error('\n❌ Spec traceability check FAILED — broken file references:\n');
  const byDoc = {};
  for (const { doc, ref } of errors) {
    (byDoc[doc] = byDoc[doc] || []).push(ref);
  }
  for (const [doc, refs] of Object.entries(byDoc)) {
    console.error(`  ${doc}:`);
    refs.forEach(r => console.error(`    • ${r} (not found)`));
  }
  console.error('\nFix: update the reference in the doc or restore the file.\n');
}

if (!failed) {
  const total = SCAN_DIRS.reduce((n, d) => n + scanDir(d).length, 0);
  console.log(`✅ Spec traceability OK — ${total} docs scanned, all file references valid.`);
  process.exit(0);
}

if (strict) {
  process.exit(1);
}

console.warn('⚠ Continuing because --strict not set.');
process.exit(0);
