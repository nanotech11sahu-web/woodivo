// Serves /sitemap.xml — the index file crawlers/Search Console are pointed
// at, listing every section file. Fetches live counts on every request so
// it always lists the right number of sitemap-products-N.xml /
// sitemap-blogs-N.xml chunk files as content is added, instead of the
// count getting frozen at whatever it was on the last frontend deploy.
import { CACHE_CONTROL, absoluteUrl, escapeXml, chunkCount, fetchSitemapData } from './_lib/sitemap.js';

export default async function handler(_req, res) {
  try {
    const data = await fetchSitemapData();
    const productPages = chunkCount(data.products.length);
    const blogPages = chunkCount(data.blogs.length);

    const files = [
      'sitemap-pages.xml',
      'sitemap-categories.xml',
      ...Array.from({ length: productPages }, (_, i) => `sitemap-products-${i + 1}.xml`),
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

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', CACHE_CONTROL);
    res.status(200).send(
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        sitemapTags.join('\n') +
        `\n</sitemapindex>\n`,
    );
  } catch (error) {
    console.error('[sitemap-index] generation failed:', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    // Minimal valid index (pages section is fully static, never depends on
    // the backend) so a transient backend blip doesn't 500 the one URL
    // Search Console has on file.
    res.status(200).send(
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `  <sitemap>\n    <loc>${escapeXml(absoluteUrl('/sitemap-pages.xml'))}</loc>\n  </sitemap>\n` +
        `</sitemapindex>\n`,
    );
  }
}
