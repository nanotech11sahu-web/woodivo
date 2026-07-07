import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Faq, FaqSchema } from './schemas/faq.schema';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { FaqsAdminController } from './faqs.admin.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }])],
  controllers: [FaqsController, FaqsAdminController],
  providers: [FaqsService],
  exports: [MongooseModule, FaqsService],
})
export class FaqsModule {}
