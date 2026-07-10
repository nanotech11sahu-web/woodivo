import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {
  Category,
  CategorySchema,
} from '@modules/categories/schemas/category.schema';
import {
  Product,
  ProductSchema,
} from '@modules/products/schemas/product.schema';
import { Blog, BlogSchema } from '@modules/blogs/schemas/blog.schema';
import {
  GalleryItem,
  GalleryItemSchema,
} from '@modules/gallery/schemas/gallery-item.schema';
import {
  Testimonial,
  TestimonialSchema,
} from '@modules/testimonials/schemas/testimonial.schema';
import { Faq, FaqSchema } from '@modules/faqs/schemas/faq.schema';
import { EnquiriesModule } from '@modules/enquiries/enquiries.module';

@Module({
  imports: [
    // Models registered directly rather than importing each feature module,
    // to keep this a read-only aggregation point with no write-side deps —
    // same "register the schema directly" pattern used by Products/Categories
    // for reads. Enquiries is the one exception: its stats aggregation
    // already exists on EnquiriesService, so that's reused via the module's
    // export instead of duplicating the $group pipeline here.
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: GalleryItem.name, schema: GalleryItemSchema },
      { name: Testimonial.name, schema: TestimonialSchema },
      { name: Faq.name, schema: FaqSchema },
    ]),
    EnquiriesModule,
  ],
  controllers: [HealthController, DashboardController],
  providers: [DashboardService],
})
export class HealthModule {}
