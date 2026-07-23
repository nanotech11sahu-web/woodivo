import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TranslationCache,
  TranslationCacheSchema,
} from './schemas/translation-cache.schema';
import { TranslationService } from './translation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TranslationCache.name, schema: TranslationCacheSchema },
    ]),
  ],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
