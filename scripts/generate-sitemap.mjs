#!/usr/bin/env node
// Generates frontend/public/sitemap.xml + frontend/public/robots.txt from
// live backend data, run as part of the frontend build (see
// frontend/package.json's "build" script). This is a pure-SPA site (no
// server rendering), so these are the only artifacts a crawler gets
// without executing JS — everything else (meta tags, JSON-LD) is injected
// client-side by useSeoMeta/useJsonLd and only ever seen by a JS-capable
// crawler.
//
// Env vars (falls back to frontend/.env, then to localhost defaults):
//   VITE_API_BASE_URL   e.g. https://api.yourdomain.com/api/v1
//   VITE_PUBLIC_SITE_URL e.g. https://yourdomain.com

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '../frontend');

function loadDotEnvFallback(key) {
  const envPath = path.join(frontendDir, '.env');
  if (!existsSync(envPath)) return undefined;
  const line = readFileSync(envPath, 'utf-8')
    .split('\n')
    .find((l) => l.trim().startsWith(`${key}=`));
  return line?.split('=').slice(1).join('=').trim();
}

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || loadDotEnvFallback('VITE_API_BASE_URL') || 'http://localhost:4000/api/v1';
const SITE_URL = (
  process.env.VITE_PUBLIC_SITE_URL || loadDotEnvFallback('VITE_PUBLIC_SITE_URL') || 'http://localhost:5173'
).replace(/\/$/, '');

const STATIC_PATHS = ['/', '/about', '/contact', '/gallery', '/categories', '/blogs', '/customize', '/sitemap'];

function xmlEscape(value) {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return char;
    }
  });
}

function urlEntry(pathname, lastmod) {
  const loc = `${SITE_URL}${pathname}`;
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

async function fetchJson(pathname) {
  const res = await fetch(`${API_BASE_URL}${pathname}`);
  if (!res.ok) throw new Error(`${pathname} responded ${res.status}`);
  const body = await res.json();
  return body.data;
}

async function main() {
  const [sitemapData, subCategories] = await Promise.all([
    fetchJson('/seo/sitemap-data'),
    fetchJson('/subcategories'),
  ]);

  const entries = [
    ...STATIC_PATHS.map((p) => urlEntry(p)),
    ...sitemapData.categories.map((c) => urlEntry(`/categories/${c.slug}`, c.updatedAt)),
    ...subCategories.map((sc) => urlEntry(`/categories/${sc.category.slug}/${sc.slug}`, sc.updatedAt)),
    ...sitemapData.products.map((p) => urlEntry(`/products/${p.slug}`, p.updatedAt)),
    ...sitemapData.blogs.map((b) => urlEntry(`/blogs/${b.slug}`, b.updatedAt)),
  ];

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /search',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  writeFileSync(path.join(frontendDir, 'public/sitemap.xml'), sitemap);
  writeFileSync(path.join(frontendDir, 'public/robots.txt'), robots);

  console.log(
    `Wrote sitemap.xml (${entries.length} urls) and robots.txt to frontend/public/, pointing at ${SITE_URL}`,
  );
}

main().catch((error) => {
  console.error('generate-sitemap failed:', error.message);
  // A missing/unreachable backend shouldn't fail the whole frontend build
  // (e.g. a local `vite build` with no backend running) — warn and move on
  // rather than blocking `npm run build`.
  process.exit(0);
});
