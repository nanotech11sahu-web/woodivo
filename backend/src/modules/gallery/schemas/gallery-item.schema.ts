import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';

export type GalleryItemDocument = HydratedDocument<GalleryItem>;

export enum GalleryItemType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum GalleryItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class GalleryItem {
  @Prop({ required: true, type: MediaAssetSchema })
  media!: MediaAsset;

  @Prop({ trim: true, maxlength: 150 })
  caption?: string;

  @Prop({
    type: String,
    enum: GalleryItemType,
    default: GalleryItemType.IMAGE,
    index: true,
  })
  type!: GalleryItemType;

  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({
    type: String,
    enum: GalleryItemStatus,
    default: GalleryItemStatus.ACTIVE,
    index: true,
  })
  status!: GalleryItemStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const GalleryItemSchema = SchemaFactory.createForClass(GalleryItem);

GalleryItemSchema.index({ displayOrder: 1 });
