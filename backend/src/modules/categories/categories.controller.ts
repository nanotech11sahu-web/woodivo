import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { TranslationService } from '@modules/translation/translation.service';
import { CategoriesService } from './categories.service';

@Public()
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  async findAll(
    @Query('featured') featured?: string,
    @Query('lang') lang = 'en',
  ) {
    const categories = await this.categoriesService.findAllPublic(
      featured === 'true',
    );
    return this.translationService.translateList(categories, ['name'], lang);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Query('lang') lang = 'en') {
    const category = await this.categoriesService.findBySlugPublic(slug);
    return this.translationService.translateFields(category, ['name'], lang);
  }
}
