#!/usr/bin/env node
/**
 * qa-spec-report.js
 *
 * Generates an SDD status report without shelling out to other scripts. This keeps
 * the report usable in restricted Windows/sandbox environments.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const SPECS_ROOT = path.join(ROOT, 'docs/specs');
const APP_DIR = path.join(ROOT, 'frontend/src/app');
const MANIFEST_PATH = path.join(ROOT, 'docs/specs/api-contracts/MANIFEST.json');

const REQUIRED_SECTIONS = [
  /^##\s+problem/i,
  /^##\s+goal/i,
  /^##\s+scope/i,
  /^##\s+constraints/i,
  /^##\s+.*acceptance criteria/i,
  /^##\s+definition of done/i,
];

function walkFiles(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'templates') continue;
      walkFiles(full, predicate, out);
    } else if (predicate(full, entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function findSpecs() {
  return walkFiles(SPECS_ROOT, (_full, name) => name === 'spec.md')
    .filter(file => !rel(file).includes('/api-contracts/'))
    .sort();
}

function discoverRoutes(dir = APP_DIR) {
  const routes = [];
  if (!fs.existsSync(dir)) return routes;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) routes.push(...discoverRoutes(full));
    else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      routes.push(`/${path.relative(APP_DIR, dir).replace(/\\/g, '/')}`);
    }
  }
  return routes.sort();
}

function structureStatus(specs) {
  const broken = [];
  for (const file of specs) {
    const parsed = matter(fs.readFileSync(file, 'utf8'));
    const lines = parsed.content.replace(/\r\n/g, '\n').split('\n');
    const hasFrontmatter = parsed.data.version && parsed.data.status && parsed.data.owner;
    const hasSections = REQUIRED_SECTIONS.every(re => lines.some(line => re.test(line)));
    if (!hasFrontmatter || !hasSections) broken.push(rel(file));
  }
  return broken;
}

function completenessStatus() {
  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')).routes || {}
    : {};
  const routes = discoverRoutes();
  const missing = routes.filter(route => !manifest[route]);
  const missingContracts = Object.values(manifest)
    .filter((contract, index, all) => all.indexOf(contract) === index)
    .filter(contract => !fs.existsSync(path.join(ROOT, contract)));
  return { routes, missing, missingContracts };
}

const FILE_REF_RE = /`((?:frontend|scripts|docs)\/[^\s`]+\.(?:ts|tsx|js|md|json|prisma))(?::\d+)?`/g;
const TABLE_REF_RE = /\|(.*?)\|/g;
const PATH_IN_TABLE_RE = /((?:frontend|scripts|docs)\/[^\s|,)]+\.(?:ts|tsx|js|md|json|prisma))(?::\d+)?/g;

function traceabilityStatus() {
  const docs = [
    ...walkFiles(path.join(ROOT, 'docs/specs'), (_full, name) => name.endsWith('.md') && name !== 'TUTORIAL-FIRST-SPEC.md'),
    ...walkFiles(path.join(ROOT, 'docs/adr'), (_full, name) => name.endsWith('.md')),
  ];
  const broken = [];
  for (const doc of docs) {
    const content = fs.readFileSync(doc, 'utf8');
    const refs = new Set();
    let match;
    while ((match = FILE_REF_RE.exec(content)) !== null) refs.add(match[1]);
    FILE_REF_RE.lastIndex = 0;
    while ((match = TABLE_REF_RE.exec(content)) !== null) {
      let pathMatch;
      while ((pathMatch = PATH_IN_TABLE_RE.exec(match[1])) !== null) refs.add(pathMatch[1]);
      PATH_IN_TABLE_RE.lastIndex = 0;
    }
    TABLE_REF_RE.lastIndex = 0;
    for (const ref of refs) {
      if (!fs.existsSync(path.join(ROOT, ref))) broken.push(`${rel(doc)} -> ${ref}`);
    }
  }
  return { docs, broken };
}

function verifierStatus(specs) {
  return specs.map(file => {
    const lines = matter(fs.readFileSync(file, 'utf8')).content.replace(/\r\n/g, '\n').split('\n');
    let inCriteria = false;
    let criteria = 0;
    let linked = 0;
    let broken = 0;

    for (const line of lines) {
      if (/^##\s+.*acceptance criteria/i.test(line)) {
        inCriteria = true;
        continue;
      }
      if (inCriteria && /^##\s+/.test(line)) inCriteria = false;
      if (!inCriteria || !/^[-*]\s+(\[ ]|\[x])?\s*(.+)/.test(line)) continue;
      criteria++;
      const refMatch = line.match(/\{@test:\s*([^\s}]+)\}/);
      if (!refMatch) continue;
      linked++;
      if (!fs.existsSync(path.join(ROOT, refMatch[1]))) broken++;
    }

    return { spec: rel(file), criteria, linked, broken };
  });
}

const specs = findSpecs();
const structureBroken = structureStatus(specs);
const completeness = completenessStatus();
const traceability = traceabilityStatus();
const verifier = verifierStatus(specs);

console.log('# SDD Implementation Status Report\n');

console.log('## 1. Specification Structure');
console.log(structureBroken.length === 0
  ? `✅ All ${specs.length} specs follow the required structure.\n`
  : `❌ ${structureBroken.length} specs are missing required structure.\n`);

console.log('## 2. API Contract Completeness');
const completenessFailures = completeness.missing.length + completeness.missingContracts.length;
console.log(completenessFailures === 0
  ? `✅ ${completeness.routes.length} app routes discovered, all have documented contracts.\n`
  : `❌ ${completenessFailures} API contract completeness issue(s) found.\n`);

console.log('## 3. File Traceability');
console.log(traceability.broken.length === 0
  ? `✅ ${traceability.docs.length} docs scanned, all file references are valid.\n`
  : `❌ ${traceability.broken.length} broken file reference(s) detected.\n`);

console.log('## 4. Test Coverage (Acceptance Criteria)');
for (const item of verifier) {
  const status = item.broken === 0 && item.criteria === item.linked ? '✅' : '❌';
  console.log(`- ${status} ${item.spec}: ${item.linked}/${item.criteria} criteria linked to tests.`);
}

console.log('\n---');
console.log(`Report generated at: ${new Date().toISOString()}`);
