import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Customization,
  CustomizationSchema,
} from './schemas/customization.schema';
import {
  Category,
  CategorySchema,
} from '@modules/categories/schemas/category.schema';
import { CustomizationsService } from './customizations.service';
import { CustomizationsController } from './customizations.controller';
import { CustomizationsAdminController } from './customizations.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customization.name, schema: CustomizationSchema },
      // Registered directly rather than importing CategoriesModule — same
      // avoid-a-circular-dependency reasoning as BlogsModule's own direct
      // registration of Product: this side only needs read access to
      // validate/populate the optional `category` reference.
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CustomizationsController, CustomizationsAdminController],
  providers: [CustomizationsService],
  exports: [MongooseModule, CustomizationsService],
})
export class CustomizationsModule {}
