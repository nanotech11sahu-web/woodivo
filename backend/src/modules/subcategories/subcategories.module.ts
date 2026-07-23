import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategory, SubCategorySchema } from './schemas/subcategory.schema';
import {
  Category,
  CategorySchema,
} from '@modules/categories/schemas/category.schema';
import { ProductsModule } from '@modules/products/products.module';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';
import { TranslationModule } from '@modules/translation/translation.module';
import { SubCategoriesService } from './subcategories.service';
import { SubCategoriesController } from './subcategories.controller';
import { SubCategoriesAdminController } from './subcategories.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
      // Registered directly (not via CategoriesModule) to avoid a
      // circular module dependency — same reasoning as ProductsModule's
      // direct Category registration, see products/products.module.ts.
      { name: Category.name, schema: CategorySchema },
    ]),
    // Gives access to the Product model (via ProductsModule's exported
    // MongooseModule) so deleting a subcategory can be blocked while
    // products still reference it.
    ProductsModule,
    SeoEntriesModule,
    TranslationModule,
  ],
  controllers: [SubCategoriesController, SubCategoriesAdminController],
  providers: [SubCategoriesService],
  exports: [MongooseModule, SubCategoriesService],
})
export class SubCategoriesModule {}
