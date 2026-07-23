import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Blog,
  BlogSchema,
  BlogCategory,
  BlogCategorySchema,
} from './schemas/blog.schema';
import { Product, ProductSchema } from '@modules/products/schemas/product.schema';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';
import { TranslationModule } from '@modules/translation/translation.module';
import { BlogsService } from './blogs.service';
import { BlogCategoriesService } from './blog-categories.service';
import { BlogsController } from './blogs.controller';
import { BlogsAdminController } from './blogs.admin.controller';
import { BlogCategoriesAdminController } from './blog-categories.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: BlogCategory.name, schema: BlogCategorySchema },
      // Registered directly (not via ProductsModule) to avoid a circular
      // module dependency — ProductsModule registers Blog the same way, for
      // the reverse direction (populating/validating `relatedBlogs`). This
      // side only needs it to pull a deleted post out of any product's
      // `relatedBlogs` list.
      { name: Product.name, schema: ProductSchema },
    ]),
    SeoEntriesModule,
    TranslationModule,
  ],
  controllers: [
    BlogsController,
    BlogsAdminController,
    BlogCategoriesAdminController,
  ],
  providers: [BlogsService, BlogCategoriesService],
  exports: [MongooseModule, BlogsService, BlogCategoriesService],
})
export class BlogsModule {}
