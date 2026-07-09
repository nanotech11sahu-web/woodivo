import { Controller, Get } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { SeoService } from './seo.service';

// The backend only exposes the raw content aggregation here — it is the
// single source of truth for categories/products/blogs/projects, but it
// no longer serves sitemap.xml/robots.txt itself. Those are generated as
// STATIC files on the frontend (frontend/scripts/generate-sitemap.mjs,
// run via `predev`/`prebuild`) so they're served from the site's own
// public domain directly, with no cross-domain rewrite/proxy needed.
@Public()
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap-data')
  getSitemapData() {
    return this.seoService.getSitemapData();
  }
}
