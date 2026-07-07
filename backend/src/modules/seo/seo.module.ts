import { Module } from '@nestjs/common';
import { CategoriesModule } from '@modules/categories/categories.module';
import { ProductsModule } from '@modules/products/products.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { BlogsModule } from '@modules/blogs/blogs.module';
import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';

@Module({
  imports: [CategoriesModule, ProductsModule, ProjectsModule, BlogsModule],
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
