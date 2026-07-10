// Serves each individual sitemap-*.xml section file, generated fresh from
// live backend data on every request (see vercel.json for the rewrites
// that route e.g. /sitemap-blogs-2.xml here as ?type=blogs&page=2).
import {
  STATIC_ROUTES,
  CACHE_CONTROL,
  absoluteUrl,
  escapeXml,
  wrapUrlset,
  buildEntityUrls,
  chunkOf,
  fetchSitemapData,
} from './_lib/sitemap.js';

export default async function handler(req, res) {
  const { type } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);

  try {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', CACHE_CONTROL);

    if (type === 'pages') {
      const urls = STATIC_ROUTES.map(
        (route) =>
          `  <url>\n` +
          `    <loc>${escapeXml(absoluteUrl(route.path))}</loc>\n` +
          `    <changefreq>${route.changefreq}</changefreq>\n` +
          `    <priority>${route.priority.toFixed(1)}</priority>\n` +
          `  </url>`,
      );
      res.status(200).send(wrapUrlset(urls));
      return;
    }

    const data = await fetchSitemapData();

    if (type === 'categories') {
      res.status(200).send(wrapUrlset(buildEntityUrls(data.categories, '/categories', 0.8, 'weekly')));
      return;
    }

    if (type === 'products') {
      const urls = buildEntityUrls(chunkOf(data.products, page), '/products', 0.8, 'weekly');
      res.status(200).send(wrapUrlset(urls));
      return;
    }

    if (type === 'blogs') {
      const urls = buildEntityUrls(chunkOf(data.blogs, page), '/blogs', 0.6, 'monthly');
      if (page === 1) {
        urls.unshift(
          `  <url>\n` +
            `    <loc>${escapeXml(absoluteUrl('/blogs'))}</loc>\n` +
            `    <changefreq>daily</changefreq>\n` +
            `    <priority>0.7</priority>\n` +
            `  </url>`,
        );
      }
      res.status(200).send(wrapUrlset(urls));
      return;
    }

    res.status(400).send('Unknown sitemap type');
  } catch (error) {
    console.error('[sitemap] generation failed:', error);
    // Empty-but-valid urlset beats a broken/500 sitemap sitting in Search
    // Console — crawlers just see nothing new this pass, and the next
    // request retries against the backend since nothing gets cached on error.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(wrapUrlset([]));
  }
}
