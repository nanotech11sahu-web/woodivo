import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Blog,
  BlogSchema,
  BlogCategory,
  BlogCategorySchema,
} from './schemas/blog.schema';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';
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
    ]),
    SeoEntriesModule,
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
