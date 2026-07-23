import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class TranslationCache {
  @Prop({ required: true })
  sourceHash!: string;

  @Prop({ required: true })
  sourceText!: string;

  @Prop({ required: true })
  targetLang!: string;

  @Prop({ required: true })
  translatedText!: string;
}

export type TranslationCacheDocument = HydratedDocument<TranslationCache>;
export const TranslationCacheSchema =
  SchemaFactory.createForClass(TranslationCache);

// One cached translation per (source text, target language) pair.
TranslationCacheSchema.index(
  { sourceHash: 1, targetLang: 1 },
  { unique: true },
);
