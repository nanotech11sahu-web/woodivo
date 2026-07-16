import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import {
  SubCategory,
  SubCategorySchema,
} from '@modules/subcategories/schemas/subcategory.schema';
import { ProductsModule } from '@modules/products/products.module';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesAdminController } from './categories.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      // Registered directly (not via SubCategoriesModule) to avoid a
      // circular module dependency — SubCategoriesModule doesn't depend
      // on CategoriesModule, so this stays one-directional. Used only to
      // block deleting a category that still has subcategories.
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
    ProductsModule,
    SeoEntriesModule,
  ],
  controllers: [CategoriesController, CategoriesAdminController],
  providers: [CategoriesService],
  exports: [MongooseModule, CategoriesService],
})
export class CategoriesModule {}
