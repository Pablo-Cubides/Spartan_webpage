#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOTS = [path.join(process.cwd(), 'blog-posts')];
const NEXT_CONFIG_PATH = path.join(process.cwd(), 'frontend', 'next.config.ts');

function readNextConfigHostnames() {
  try {
    const txt = fs.readFileSync(NEXT_CONFIG_PATH, 'utf8');
    const hostRegex = /hostname:\s*["']([^"']+)["']/g;
    const hosts = new Set();
    let m;
    while ((m = hostRegex.exec(txt)) !== null) hosts.add(m[1]);
    return Array.from(hosts);
  } catch (e) {
    return [];
  }
}

const DEFAULT_ALLOWED = new Set([
  'res.cloudinary.com',
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'replicate.delivery',
  'supabase.co',
  'localhost',
  '127.0.0.1',
]);

function walkDir(dir, exts = ['.md', '.mdx'], out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, exts, out);
    else if (exts.includes(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function extractImageUrls(content) {
  const urls = new Set();
  const mdImg = /!\[[^\]]*\]\(([^)\s]+)\)/g;
  let m;
  while ((m = mdImg.exec(content)) !== null) urls.add(m[1]);
  try {
    const fm = matter(content).data || {};
    if (fm.featuredImage) urls.add(String(fm.featuredImage));
  } catch (e) {}
  const htmlImg = /<img[^>]+src=["']([^"']+)["']/g;
  while ((m = htmlImg.exec(content)) !== null) urls.add(m[1]);
  return Array.from(urls);
}

function isAllowed(url, allowedHosts) {
  if (!url) return true;
  if (url.startsWith('data:')) return true;
  if (url.startsWith('/')) return true;
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (allowedHosts.has(host)) return true;
    for (const h of Array.from(allowedHosts)) {
      if (h.startsWith('*.')) {
        const suffix = h.slice(2);
        if (host === suffix || host.endsWith('.' + suffix)) return true;
      } else if (host === h || host.endsWith('.' + h)) return true;
    }
    return false;
  } catch (e) {
    return true;
  }
}

function findLine(content, needle) {
  const idx = content.indexOf(needle);
  if (idx === -1) return 1;
  return content.slice(0, idx).split('\n').length;
}

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict') || process.env.STRICT_IMAGE_VALIDATION === '1' || process.env.CI === 'true';

  const hostnames = new Set(readNextConfigHostnames());
  for (const h of DEFAULT_ALLOWED) hostnames.add(h);

  const files = ROOTS.flatMap((d) => walkDir(d));
  if (files.length === 0) {
    console.log('No markdown files found under blog-posts/ to validate.');
    return process.exit(0);
  }

  const issues = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const urls = extractImageUrls(content);
    for (const url of urls) {
      if (!isAllowed(url, hostnames)) {
        const line = findLine(content, url);
        issues.push({ file, url, line });
      }
    }
  }

  if (issues.length > 0) {
    console.log(`Found ${issues.length} invalid image URL(s):`);
    for (const it of issues) {
      console.log(`- ${it.file}:${it.line} → ${it.url}`);
    }
    if (strict) {
      console.error('\nFailing due to --strict mode or CI. Use --help to learn more.');
      process.exit(1);
    } else {
      console.warn('\nValidation warnings found. Rerun with --strict or set STRICT_IMAGE_VALIDATION=1 to fail the pipeline.');
      process.exit(0);
    }
  }

  console.log(`Image URL validation passed (${files.length} files scanned).`);
  process.exit(0);
}

main();
