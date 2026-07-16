import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { SubCategoriesService } from './subcategories.service';
import { QueryPublicSubCategoryDto } from './dto/query-public-subcategory.dto';

@Public()
@Controller('subcategories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Get()
  findAll(@Query() query: QueryPublicSubCategoryDto) {
    return this.subCategoriesService.findAllPublic(query.category);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.subCategoriesService.findBySlugPublic(slug);
  }
}
