import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class MediaAsset {
  @Prop({ required: true, trim: true })
  url!: string;

  @Prop({ trim: true })
  publicId?: string;

  @Prop({ trim: true, default: '' })
  alt?: string;

  @Prop()
  width?: number;

  @Prop()
  height?: number;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
