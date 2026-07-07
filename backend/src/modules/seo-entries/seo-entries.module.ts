import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoEntry, SeoEntrySchema } from './schemas/seo-entry.schema';
import { SeoEntriesService } from './seo-entries.service';
import { SeoEntriesController } from './seo-entries.controller';
import { SeoEntriesAdminController } from './seo-entries.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeoEntry.name, schema: SeoEntrySchema },
    ]),
  ],
  controllers: [SeoEntriesController, SeoEntriesAdminController],
  providers: [SeoEntriesService],
  exports: [SeoEntriesService],
})
export class SeoEntriesModule {}
