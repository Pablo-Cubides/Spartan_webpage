#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOTS = [path.join(process.cwd(), "blog-posts")];

const ALLOWED_HOSTS = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "replicate.delivery",
  "supabase.co",
  "nzkxfrvejnicvgizlmza.supabase.co",
  "localhost",
  "127.0.0.1",
]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (/\.(md|mdx)___BEGIN___COMMAND_DONE_MARKER___$LASTEXITCODE/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function extractImageUrls(content) {
  const urls = new Set();
  const markdownImage = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;
  const frontmatterImage = /featuredImage:\s*["']?(https?:\/\/[^\s"']+)["']?/g;
  let match;
  while ((match = markdownImage.exec(content)) !== null) {
    urls.add(match[1]);
  }
  while ((match = frontmatterImage.exec(content)) !== null) {
    urls.add(match[1]);
  }
  return [...urls];
}

function isAllowed(url) {
  if (url.startsWith("/") || url.startsWith("data:")) return true;
  try {
    const parsed = new URL(url);
    return ALLOWED_HOSTS.has(parsed.hostname) || [...ALLOWED_HOSTS].some((host) => parsed.hostname.endsWith(host));
  } catch {
    return true;
  }
}

function main() {
  const files = ROOTS.flatMap((dir) => walk(dir));
  const issues = [];
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    for (const url of extractImageUrls(content)) {
      if (!isAllowed(url)) {
        issues.push($ -> ___BEGIN___COMMAND_DONE_MARKER___$LASTEXITCODE{url});
      }
    }
  }
  if (issues.length > 0) {
    console.log("\nInvalid image URLs detected:");
    for (const issue of issues) {
      console.log(  ❌ ___BEGIN___COMMAND_DONE_MARKER___$LASTEXITCODE{issue});
    }
    process.exit(1);
  }
  console.log(Image URL validation passed (___BEGIN___COMMAND_DONE_MARKER___$LASTEXITCODE{files.length} files scanned).);
}

main();
