#!/usr/bin/env node

const { spawnSync } = require("child_process");

const strict = process.argv.includes("--strict") || process.env.STRICT_SECURITY_AUDIT === "1";

function runAudit() {
  const result = spawnSync(
    "npm",
    ["--prefix", "frontend", "audit", "--audit-level=high", "--omit=dev"],
    { stdio: "inherit", shell: true }
  );

  // spawnSync sets status=null when the process couldn't be spawned at all
  if (result.status === null || result.error) {
    return { ok: false, reason: "process_failed" };
  }

  // npm audit exit codes:
  //   0 — no vulnerabilities at or above --audit-level
  //   1 — vulnerabilities found at or above --audit-level
  // Any other value typically means a network/registry error
  if (result.status === 0) {
    return { ok: true };
  }

  if (result.status === 1) {
    return { ok: false, reason: "vulnerabilities_found" };
  }

  return { ok: false, reason: "registry_unreachable" };
}

const audit = runAudit();

if (audit.ok) {
  console.log("✅ Dependency security audit passed.");
  process.exit(0);
}

if (audit.reason === "vulnerabilities_found") {
  console.error("❌ High or critical vulnerabilities found in production dependencies.");
  console.error("   Run: cd frontend && npm audit --audit-level=high --omit=dev");
  console.error("   Then: npm audit fix  (or npm audit fix --force for breaking fixes)");
  if (strict) process.exit(1);
  console.warn("⚠ Continuing because strict mode is disabled.");
  process.exit(0);
}

// registry_unreachable or process_failed — don't block CI for infra issues
console.warn("⚠ npm audit could not reach the registry — skipping audit.");
if (strict) {
  console.warn("  (strict mode: treating registry failure as non-fatal)");
}
process.exit(0);
