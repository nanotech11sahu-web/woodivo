import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';

export type BannerDocument = HydratedDocument<Banner>;

export enum BannerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum BannerPlacement {
  HERO = 'hero',
  CATEGORY = 'category',
  PRODUCT = 'product',
  BLOG = 'blog',
  CONTACT = 'contact',
  ABOUT = 'about',
  PROJECTS = 'projects',
}

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true, trim: true, maxlength: 150 })
  title!: string;

  @Prop({ trim: true, maxlength: 300 })
  subtitle?: string;

  @Prop({ required: true, type: MediaAssetSchema })
  desktopImage!: MediaAsset;

  @Prop({ type: MediaAssetSchema })
  mobileImage?: MediaAsset;

  @Prop({ trim: true })
  ctaLabel?: string;

  @Prop({ trim: true })
  ctaLink?: string;

  @Prop({
    type: String,
    enum: BannerPlacement,
    default: BannerPlacement.HERO,
    index: true,
  })
  placement!: BannerPlacement;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({
    type: String,
    enum: BannerStatus,
    default: BannerStatus.ACTIVE,
    index: true,
  })
  status!: BannerStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

BannerSchema.index({ placement: 1, displayOrder: 1 });
