import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class SeoMeta {
  @Prop({ trim: true, maxlength: 70 })
  metaTitle?: string;

  @Prop({ trim: true, maxlength: 160 })
  metaDescription?: string;

  @Prop({ type: [String], default: [] })
  metaKeywords?: string[];

  @Prop({ trim: true })
  ogImage?: string;

  @Prop({ trim: true })
  canonicalUrl?: string;
}

export const SeoMetaSchema = SchemaFactory.createForClass(SeoMeta);
