import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { TranslationService } from '@modules/translation/translation.service';
import { ProductsService } from './products.service';
import { QueryPublicProductDto } from './dto/query-public-product.dto';

const TRANSLATABLE_FIELDS = ['name', 'description'];

@Public()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  async findAll(@Query() query: QueryPublicProductDto) {
    const result = await this.productsService.findAllPublic(query);
    const items = await this.translationService.translateList(
      result.items,
      TRANSLATABLE_FIELDS,
      query.lang ?? 'en',
    );
    return { ...result, items };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Query('lang') lang = 'en') {
    const product = await this.productsService.findBySlugPublic(slug);
    return this.translationService.translateFields(
      product,
      TRANSLATABLE_FIELDS,
      lang,
    );
  }
}
