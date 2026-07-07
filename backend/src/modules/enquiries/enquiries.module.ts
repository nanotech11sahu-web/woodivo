import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enquiry, EnquirySchema } from './schemas/enquiry.schema';
import {
  Category,
  CategorySchema,
} from '@modules/categories/schemas/category.schema';
import { MailModule } from '@modules/mail/mail.module';
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
    ]),
    MailModule,
  ],
  controllers: [EnquiriesController, EnquiriesAdminController],
  providers: [EnquiriesService],
  exports: [MongooseModule, EnquiriesService],
})
export class EnquiriesModule {}
