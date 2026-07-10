// Serves /robots.txt. Content never depends on live CMS data, but is still
// served dynamically (rather than as a public/robots.txt static file) so it
// always points at whatever VITE_PUBLIC_SITE_URL is set to in this Vercel
// project, and so a static file in public/ can't silently shadow the
// sitemap.xml rewrite the way the old checked-in one did.
import { getSiteUrl } from './_lib/sitemap.js';

export default function handler(_req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(`User-agent: *\nAllow: /\n\nSitemap: ${getSiteUrl()}/sitemap.xml\n`);
}
