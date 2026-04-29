#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "dist", "coverage"]);
const IGNORE_FILE_PATTERNS = [/^\.env(\..*)?$/i, /\.lock$/i];

const SECRET_PATTERNS = [
  { name: "Private key block", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "Stripe secret key", regex: /sk_(live|test)_[A-Za-z0-9]{16,}/ },
  { name: "Stripe webhook secret", regex: /whsec_[A-Za-z0-9]{16,}/ },
  { name: "Firebase / Google API key", regex: /AIza[0-9A-Za-z\-_]{20,}/ },
  { name: "Generic bearer token", regex: /Bearer\s+[A-Za-z0-9\-_=.]{20,}/ },
  { name: "Supabase service key", regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9\-_=.]+\.[A-Za-z0-9\-_=.]+/ },
];

function shouldIgnore(filePath) {
  const base = path.basename(filePath);
  if (IGNORE_FILE_PATTERNS.some((pattern) => pattern.test(base))) return true;
  return false;
}

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
    } else if (!shouldIgnore(full)) {
      results.push(full);
    }
  }

  return results;
}

function main() {
  const scanRoots = [
    path.join(ROOT, "frontend", "src"),
    path.join(ROOT, "scripts"),
    path.join(ROOT, ".github"),
    path.join(ROOT, "docs"),
    path.join(ROOT, "blog-posts"),
  ];

  const files = scanRoots.flatMap((dir) => walk(dir));
  const findings = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line) && !/your-|example|placeholder|test/i.test(line)) {
          findings.push({
            file: path.relative(ROOT, file),
            line: index + 1,
            pattern: pattern.name,
          });
        }
      }
    });
  }

  if (findings.length > 0) {
    console.log("\nPotential secrets detected:");
    for (const finding of findings) {
      console.log(`  ❌ ${finding.file}:${finding.line} (${finding.pattern})`);
    }
    process.exit(1);
  }

  console.log(`Secret scan passed (${files.length} files scanned).`);
}

main();
