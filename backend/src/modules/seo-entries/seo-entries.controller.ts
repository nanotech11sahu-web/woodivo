import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { SeoEntriesService } from './seo-entries.service';

@Public()
@Controller('seo')
export class SeoEntriesController {
  constructor(private readonly seoEntriesService: SeoEntriesService) {}

  // GET /api/v1/seo/resolve?path=/products/teak-dining-table
  // Returns null (still a 200, via the normal TransformInterceptor
  // envelope) when nothing's been entered for that path — the frontend's
  // useSeoMeta hook treats that as "use the page's own defaults", not an
  // error.
  @Get('resolve')
  resolve(@Query('path') path?: string) {
    if (!path) {
      throw new BadRequestException('path query param is required');
    }
    return this.seoEntriesService.findByPath(path);
  }
}
