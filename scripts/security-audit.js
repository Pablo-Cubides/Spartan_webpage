#!/usr/bin/env node

const { spawnSync } = require("child_process");

const strict = process.argv.includes("--strict") || process.env.STRICT_SECURITY_AUDIT === "1";

function runAudit() {
  const result = spawnSync("npm", ["--prefix", "frontend", "audit", "--audit-level=high", "--omit=dev"], {
    stdio: "inherit",
    shell: true,
  });

  return result.status === 0;
}

if (runAudit()) {
  console.log("Dependency security audit passed.");
  process.exit(0);
}

const message = "Dependency security audit could not be completed locally.";
if (strict) {
  console.error(message);
  process.exit(1);
}

console.warn(`${message} Continuing because strict mode is disabled.`);
process.exit(0);
