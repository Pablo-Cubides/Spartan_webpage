#!/usr/bin/env node

const fs = require("fs");
const { spawnSync } = require("child_process");

const scriptName = process.argv[2];

if (!scriptName) {
  console.error("Usage: node scripts/run-npm-script.js <script-name>");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const command = pkg.scripts && pkg.scripts[scriptName];

if (!command) {
  console.error(`Unknown npm script: ${scriptName}`);
  process.exit(1);
}

function splitCommand(value) {
  const parts = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = re.exec(value)) !== null) {
    parts.push(match[1] || match[2] || match[3]);
  }
  return parts;
}

function run(commandLine) {
  const parts = splitCommand(commandLine);
  const commandName = parts[0];
  const args = parts.slice(1);

  if (commandName === "node") {
    return spawnSync(process.execPath, args, {
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
  }

  if (process.platform === "win32" && commandName === "npm") {
    const psArgs = args.map(arg => {
      const escaped = String(arg).replace(/'/g, "''");
      return `'${escaped}'`;
    }).join(" ");
    return spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", `& npm.cmd ${psArgs}`], {
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
  }

  const executable = commandName;
  return spawnSync(executable, args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });
}

const result = run(command);

process.exit(result.status ?? 1);
