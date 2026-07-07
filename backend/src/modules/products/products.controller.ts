import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { ProductsService } from './products.service';
import { QueryPublicProductDto } from './dto/query-public-product.dto';

@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryPublicProductDto) {
    return this.productsService.findAllPublic(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlugPublic(slug);
  }
}
