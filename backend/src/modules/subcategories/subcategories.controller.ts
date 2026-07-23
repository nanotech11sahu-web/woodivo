import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { TranslationService } from '@modules/translation/translation.service';
import { SubCategoriesService } from './subcategories.service';
import { QueryPublicSubCategoryDto } from './dto/query-public-subcategory.dto';

@Public()
@Controller('subcategories')
export class SubCategoriesController {
  constructor(
    private readonly subCategoriesService: SubCategoriesService,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  async findAll(@Query() query: QueryPublicSubCategoryDto) {
    const subCategories = await this.subCategoriesService.findAllPublic(
      query.category,
    );
    return this.translationService.translateList(
      subCategories,
      ['name', 'description'],
      query.lang ?? 'en',
    );
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Query('lang') lang = 'en') {
    const subCategory = await this.subCategoriesService.findBySlugPublic(slug);
    return this.translationService.translateFields(
      subCategory,
      ['name', 'description'],
      lang,
    );
  }
}
