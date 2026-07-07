import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { GalleryService } from './gallery.service';
import { QueryPublicGalleryItemDto } from './dto/query-public-gallery-item.dto';

@Public()
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  findAll(@Query() query: QueryPublicGalleryItemDto) {
    return this.galleryService.findAllPublic(query);
  }
}
