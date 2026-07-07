import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { CategoriesService } from './categories.service';

@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('featured') featured?: string) {
    return this.categoriesService.findAllPublic(featured === 'true');
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findBySlugPublic(slug);
  }
}
