import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Testimonial, TestimonialSchema } from './schemas/testimonial.schema';
import { TranslationModule } from '@modules/translation/translation.module';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsAdminController } from './testimonials.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Testimonial.name, schema: TestimonialSchema },
    ]),
    TranslationModule,
  ],
  controllers: [TestimonialsController, TestimonialsAdminController],
  providers: [TestimonialsService],
  exports: [MongooseModule, TestimonialsService],
})
export class TestimonialsModule {}
