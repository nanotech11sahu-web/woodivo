import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import {
  Category,
  CategorySchema,
} from '@modules/categories/schemas/category.schema';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsAdminController } from './products.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      // Registered directly (not via CategoriesModule) to avoid a circular
      // module dependency, since CategoriesModule imports ProductsModule
      // for its own referential-integrity checks.
      { name: Category.name, schema: CategorySchema },
    ]),
    SeoEntriesModule,
  ],
  controllers: [ProductsController, ProductsAdminController],
  providers: [ProductsService],
  exports: [MongooseModule, ProductsService],
})
export class ProductsModule {}
