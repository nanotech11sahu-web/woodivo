import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '@common/decorators/public.decorator';
import { SeoService } from './seo.service';

@Public()
@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  // Kept under the normal API prefix (/api/v1/seo/sitemap-data) — this is
  // the raw aggregation, not a crawler-facing route, so it goes through
  // the standard TransformInterceptor JSON envelope like every other
  // endpoint.
  @Get('seo/sitemap-data')
  getSitemapData() {
    return this.seoService.getSitemapData();
  }

  // Crawlers expect sitemap.xml/robots.txt at the site root, not under
  // /api/v1 — main.ts excludes these two paths from the global prefix.
  // @Res() (without { passthrough: true }) hands us the raw Express
  // response and opts this route out of Nest's normal response handling,
  // so the TransformInterceptor's JSON-envelope mapping is never applied
  // and the body we send here is exactly what goes over the wire.
  @Get('sitemap.xml')
  async getSitemapXml(@Res() res: Response): Promise<void> {
    const xml = await this.seoService.getSitemapXml();
    res.type('application/xml').send(xml);
  }

  @Get('robots.txt')
  getRobotsTxt(@Res() res: Response): void {
    res.type('text/plain').send(this.seoService.getRobotsTxt());
  }
}
