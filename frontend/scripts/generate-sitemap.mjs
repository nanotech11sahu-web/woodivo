#!/usr/bin/env node
// Generates static sitemap files (public/sitemap*.xml + public/robots.txt)
// from live content on the backend, so the FRONTEND serves them directly
// from its own origin — no cross-domain rewrite/proxy to the backend
// needed at request time.
//
// The backend is still the source of truth for content (categories,
// products, blogs, projects); this script just asks it once, at build
// (or dev-start) time, and bakes the answer into flat files that Vite's
// `public/` directory serves as-is, both in `vite dev` and the built site.
//
// Wired as `predev`/`prebuild` in package.json, or run manually:
//   npm run generate:sitemap

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Matches the batch size the CMS/admin team agreed on: predictable, small,
// cacheable files instead of one that grows unbounded as content is added.
const SITEMAP_CHUNK_SIZE = 100;

/** Minimal .env reader — avoids adding a dotenv dependency just for this
 * script. `.env.local` wins over `.env`, matching Vite's own precedence. */
function loadEnv() {
  const env = { ...process.env };
  for (const file of ['.env.local', '.env']) {
    const filePath = path.join(ROOT, file);
    if (!existsSync(filePath)) continue;
    const contents = readFileSync(filePath, 'utf-8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      value = value.replace(/^['"]|['"]$/g, '');
      if (!(key in env)) env[key] = value;
    }
  }
  return env;
}

const env = loadEnv();
const API_BASE_URL = (env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1').replace(/\/+$/, '');
// The frontend's OWN public domain — this is what every <loc> in the
// generated files is built from. Deliberately separate from
// VITE_API_BASE_URL: that's where content is fetched FROM, this is what
// it's published AT.
const SITE_URL = (env.VITE_PUBLIC_SITE_URL ?? 'http://localhost:5173').replace(/\/+$/, '');

// Mirrors the top-level routes in src/routes.tsx that don't take a
// :slug — entity routes are appended separately from live content.
const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/projects', changefreq: 'weekly', priority: 0.7 },
  { path: '/gallery', changefreq: 'monthly', priority: 0.5 },
  { path: '/blogs', changefreq: 'daily', priority: 0.7 },
  { path: '/contact', changefreq: 'monthly', priority: 0.5 },
];

function absoluteUrl(p) {
  return `${SITE_URL}${p}`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapUrlset(urls) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join('\n') +
    `\n</urlset>\n`
  );
}

function buildEntityUrls(entries, basePath, priority, changefreq) {
  return entries.map((entry) => {
    const loc = absoluteUrl(`${basePath}/${entry.slug}`);
    const lastmod = new Date(entry.updatedAt).toISOString().split('T')[0];
    return (
      `  <url>\n` +
      `    <loc>${escapeXml(loc)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${changefreq}</changefreq>\n` +
      `    <priority>${priority.toFixed(1)}</priority>\n` +
      `  </url>`
    );
  });
}

function chunkOf(entries, page) {
  const start = (page - 1) * SITEMAP_CHUNK_SIZE;
  return entries.slice(start, start + SITEMAP_CHUNK_SIZE);
}

function chunkCount(total) {
  return Math.max(1, Math.ceil(total / SITEMAP_CHUNK_SIZE));
}

async function fetchSitemapData() {
  const url = `${API_BASE_URL}/seo/sitemap-data`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status} ${res.statusText}`);
  }
  const body = await res.json();
  // Every backend response is wrapped by TransformInterceptor as
  // { success, data, ... } — unwrap it, but tolerate a bare payload too.
  return body.data ?? body;
}

async function main() {
  console.log(`[sitemap] fetching content from ${API_BASE_URL}/seo/sitemap-data ...`);
  const data = await fetchSitemapData();
  const categories = data.categories ?? [];
  const products = data.products ?? [];
  const blogs = data.blogs ?? [];
  const projects = data.projects ?? [];

  if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });

  // sitemap-pages.xml — main static pages
  const pageUrls = STATIC_ROUTES.map(
    (route) =>
      `  <url>\n` +
      `    <loc>${escapeXml(absoluteUrl(route.path))}</loc>\n` +
      `    <changefreq>${route.changefreq}</changefreq>\n` +
      `    <priority>${route.priority.toFixed(1)}</priority>\n` +
      `  </url>`,
  );
  writeFileSync(path.join(PUBLIC_DIR, 'sitemap-pages.xml'), wrapUrlset(pageUrls));

  // sitemap-categories.xml — every category page
  writeFileSync(
    path.join(PUBLIC_DIR, 'sitemap-categories.xml'),
    wrapUrlset(buildEntityUrls(categories, '/categories', 0.8, 'weekly')),
  );

  // sitemap-products-N.xml — 100 products per file
  const productPages = chunkCount(products.length);
  for (let page = 1; page <= productPages; page++) {
    writeFileSync(
      path.join(PUBLIC_DIR, `sitemap-products-${page}.xml`),
      wrapUrlset(buildEntityUrls(chunkOf(products, page), '/products', 0.8, 'weekly')),
    );
  }

  // sitemap-projects.xml — every project page
  writeFileSync(
    path.join(PUBLIC_DIR, 'sitemap-projects.xml'),
    wrapUrlset(buildEntityUrls(projects, '/projects', 0.6, 'monthly')),
  );

  // sitemap-blogs-N.xml — 100 posts per file; the first batch leads with
  // the /blogs listing page itself, then its 100 posts.
  const blogPages = chunkCount(blogs.length);
  for (let page = 1; page <= blogPages; page++) {
    const urls = buildEntityUrls(chunkOf(blogs, page), '/blogs', 0.6, 'monthly');
    if (page === 1) {
      urls.unshift(
        `  <url>\n` +
          `    <loc>${escapeXml(absoluteUrl('/blogs'))}</loc>\n` +
          `    <changefreq>daily</changefreq>\n` +
          `    <priority>0.7</priority>\n` +
          `  </url>`,
      );
    }
    writeFileSync(path.join(PUBLIC_DIR, `sitemap-blogs-${page}.xml`), wrapUrlset(urls));
  }

  // sitemap.xml — the index crawlers/search consoles are pointed at
  const files = [
    'sitemap-pages.xml',
    'sitemap-categories.xml',
    ...Array.from({ length: productPages }, (_, i) => `sitemap-products-${i + 1}.xml`),
    'sitemap-projects.xml',
    ...Array.from({ length: blogPages }, (_, i) => `sitemap-blogs-${i + 1}.xml`),
  ];
  const now = new Date().toISOString();
  const sitemapTags = files.map(
    (file) =>
      `  <sitemap>\n` +
      `    <loc>${escapeXml(absoluteUrl(`/${file}`))}</loc>\n` +
      `    <lastmod>${now}</lastmod>\n` +
      `  </sitemap>`,
  );
  writeFileSync(
    path.join(PUBLIC_DIR, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      sitemapTags.join('\n') +
      `\n</sitemapindex>\n`,
  );

  // robots.txt
  writeFileSync(
    path.join(PUBLIC_DIR, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`,
  );

  console.log(
    `[sitemap] wrote sitemap.xml + ${files.length} section file(s) + robots.txt -> ${PUBLIC_DIR}`,
  );
}

main().catch((error) => {
  console.error(`[sitemap] generation failed: ${error.message}`);
  console.error('[sitemap] is the backend running? Check VITE_API_BASE_URL in .env');
  // Non-fatal for local dev (predev) — the SPA should still boot even if
  // the sitemap couldn't be refreshed. `npm run build`'s prebuild step
  // treats a non-zero exit as fatal via `&&`, so production still fails
  // loudly if content can't be fetched.
  process.exitCode = 1;
});
