#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(process.cwd(), "blog-posts");
const STRICT = process.argv.includes("--strict") || process.env.CONTENT_VALIDATION_STRICT === "1";

function parseFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  if (lines[0] !== "---") {
    return null;
  }

  const endIndex = lines.indexOf("---", 1);
  if (endIndex === -1) {
    return null;
  }

  const data = {};
  for (const line of lines.slice(1, endIndex)) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    data[key] = value;
  }

  return {
    data,
    body: lines.slice(endIndex + 1).join("\n").trim(),
  };
}

function validatePost(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = parseFrontmatter(content);
  const issues = [];
  const warnings = [];

  if (!parsed) {
    return { issues: ["Missing or invalid frontmatter"], warnings };
  }

  const { data, body } = parsed;
  const required = ["title", "slug", "date", "category", "author", "featuredImage"];

  for (const key of required) {
    if (!data[key] || String(data[key]).trim() === "") {
      issues.push(`Missing required frontmatter field: ${key}`);
    }
  }

  if (data.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(data.slug))) {
    issues.push("Invalid slug format");
  }

  if (data.date && Number.isNaN(Date.parse(String(data.date)))) {
    issues.push("Invalid date format");
  }

  if (!data.description || String(data.description).trim() === "") {
    warnings.push("Empty description (recommended for SEO)");
  } else if (String(data.description).length > 160) {
    warnings.push("Description exceeds 160 characters");
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 250) {
    warnings.push(`Short body (${words} words)`);
  }

  return { issues, warnings };
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log("No blog-posts directory found; skipping.");
    process.exit(0);
  }

  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".md"));
  let criticalIssues = 0;
  let warningCount = 0;

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const { issues, warnings } = validatePost(filePath);

    if (issues.length > 0 || warnings.length > 0) {
      console.log(`\n${file}`);
      for (const issue of issues) {
        console.log(`  ❌ ${issue}`);
      }
      for (const warning of warnings) {
        console.log(`  ⚠️ ${warning}`);
      }
    }

    criticalIssues += issues.length;
    warningCount += warnings.length;
  }

  console.log(`\nBlog content scan complete: ${criticalIssues} issues, ${warningCount} warnings.`);

  if (criticalIssues > 0 || (STRICT && warningCount > 0)) {
    process.exit(1);
  }

  process.exit(0);
}

main();
