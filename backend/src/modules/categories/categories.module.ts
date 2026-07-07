import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { ProductsModule } from '@modules/products/products.module';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesAdminController } from './categories.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    ProductsModule,
    SeoEntriesModule,
  ],
  controllers: [CategoriesController, CategoriesAdminController],
  providers: [CategoriesService],
  exports: [MongooseModule, CategoriesService],
})
export class CategoriesModule {}
