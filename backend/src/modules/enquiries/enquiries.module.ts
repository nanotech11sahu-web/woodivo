import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enquiry, EnquirySchema } from './schemas/enquiry.schema';
import {
  Category,
  CategorySchema,
} from '@modules/categories/schemas/category.schema';
import { Product, ProductSchema } from '@modules/products/schemas/product.schema';
import { MailModule } from '@modules/mail/mail.module';
import { MediaModule } from '@modules/media/media.module';
import { EnquiriesService } from './enquiries.service';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesAdminController } from './enquiries.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enquiry.name, schema: EnquirySchema },
      // Registered directly rather than importing CategoriesModule, to keep
      // this module lightweight and avoid pulling in Categories' own
      // ProductsModule dependency chain.
      { name: Category.name, schema: CategorySchema },
      // Same reasoning — needed to resolve `interestedProduct` (customize
      // requests are always product-scoped) without importing ProductsModule.
      { name: Product.name, schema: ProductSchema },
    ]),
    MailModule,
    // For the public "upload-images" endpoint the customize-request form
    // posts reference photos to, ahead of the enquiry itself.
    MediaModule,
  ],
  controllers: [EnquiriesController, EnquiriesAdminController],
  providers: [EnquiriesService],
  exports: [MongooseModule, EnquiriesService],
})
export class EnquiriesModule {}
