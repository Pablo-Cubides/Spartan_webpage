#!/usr/bin/env node

const { spawnSync } = require("child_process");

const steps = [
  ["qa:content:validate", "Blog content validation"],
  ["qa:images:validate", "Image URL validation"],
  ["qa:security:secrets", "Secret scan"],
  ["qa:security:deps", "Dependency security audit"],
  ["qa:lint", "Lint"],
  ["qa:typecheck", "TypeScript typecheck"],
  ["qa:test", "Tests"],
  ["qa:prisma:validate", "Prisma validate"],
  ["qa:build", "Build"],
];

function run(command, description) {
  console.log(`\n🚀 ${description}...`);
  const result = spawnSync("npm", ["run", command], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, SKIP_ENV_VALIDATION: "1" },
  });

  if (result.status !== 0) {
    console.error(`\n❌ ${description} failed.`);
    process.exit(result.status ?? 1);
  }

  console.log(`✅ ${description} passed.`);
}

console.log("\n--- PRE-PUSH SSD GATE ---");

for (const [command, description] of steps) {
  run(command, description);
}

console.log("\n✨ All SSD pre-push checks passed. Ready to push! ✨");
