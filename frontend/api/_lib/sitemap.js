// Shared helpers for the dynamic sitemap serverless functions
// (api/sitemap.js, api/sitemap-index.js).
//
// These replace the old build-time-only frontend/scripts/generate-sitemap.mjs
// approach: that script only ran on `predev`/`prebuild`, so sitemap.xml and
// its section files were baked into public/ once at deploy time and never
// changed again until the next deploy — a blog published or edited in the
// CMS an hour after a deploy simply wouldn't show up in the sitemap until
// someone redeployed the frontend. These functions instead fetch live data
// from the backend on every request (with a short edge cache, see the
// CACHE_CONTROL export below), so the sitemap always reflects what's
// actually in the CMS right now.

// Matches the batch size the CMS/admin team agreed on: predictable, small,
// cacheable files instead of one that grows unbounded as content is added.
export const SITEMAP_CHUNK_SIZE = 100;

// Mirrors the top-level routes in src/routes.tsx that don't take a
// :slug — entity routes are appended separately from live content.
export const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/gallery', changefreq: 'monthly', priority: 0.5 },
  { path: '/blogs', changefreq: 'daily', priority: 0.7 },
  { path: '/contact', changefreq: 'monthly', priority: 0.5 },
];

// Vercel serverless functions read plain process.env — the VITE_ prefix is
// only needed for variables Vite inlines into the *client* bundle, so the
// same names set in the Vercel project's Environment Variables work here
// unprefixed-requirement-free.
export function getApiBaseUrl() {
  return (process.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, '');
}

export function getSiteUrl() {
  return (process.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '');
}

// Short edge cache so a burst of crawler requests doesn't hammer the
// backend on every hit, but content still goes stale for at most a few
// minutes — not an entire deploy cycle like the old static-file approach.
export const CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=600';

export function absoluteUrl(p) {
  return `${getSiteUrl()}${p}`;
}

export function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function wrapUrlset(urls) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join('\n') +
    `\n</urlset>\n`
  );
}

export function buildEntityUrls(entries, basePath, priority, changefreq) {
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

export function chunkOf(entries, page) {
  const start = (page - 1) * SITEMAP_CHUNK_SIZE;
  return entries.slice(start, start + SITEMAP_CHUNK_SIZE);
}

export function chunkCount(total) {
  return Math.max(1, Math.ceil(total / SITEMAP_CHUNK_SIZE));
}

export async function fetchSitemapData() {
  const url = `${getApiBaseUrl()}/seo/sitemap-data`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status} ${res.statusText}`);
  }
  const body = await res.json();
  // Every backend response is wrapped by TransformInterceptor as
  // { success, data, ... } — unwrap it, but tolerate a bare payload too.
  const data = body.data ?? body;
  return {
    categories: data.categories ?? [],
    products: data.products ?? [],
    blogs: data.blogs ?? [],
  };
}
