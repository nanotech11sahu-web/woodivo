import { Controller, Get } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { SeoService } from './seo.service';

// The backend only exposes the raw content aggregation here — it is the
// single source of truth for categories/products/blogs/projects, but it
// doesn't serve sitemap.xml/robots.txt itself. Those are generated on the
// frontend (frontend/api/sitemap.js, sitemap-index.js, robots.js — Vercel
// serverless functions that call this endpoint on every request) so they're
// served from the site's own public domain directly, with no cross-domain
// rewrite/proxy needed, and always reflect whatever's live here right now.
@Public()
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap-data')
  getSitemapData() {
    return this.seoService.getSitemapData();
  }
}
