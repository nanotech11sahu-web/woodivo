import { Module } from '@nestjs/common';
import { CategoriesModule } from '@modules/categories/categories.module';
import { ProductsModule } from '@modules/products/products.module';
import { BlogsModule } from '@modules/blogs/blogs.module';
import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';

@Module({
  imports: [CategoriesModule, ProductsModule, BlogsModule],
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
