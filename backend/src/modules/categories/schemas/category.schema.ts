import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';
import { slugify } from '@common/utils/slugify';

export type CategoryDocument = HydratedDocument<Category>;

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  slug!: string;

  @Prop({ type: MediaAssetSchema })
  banner?: MediaAsset;

  @Prop({ type: MediaAssetSchema })
  thumbnail?: MediaAsset;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({
    type: String,
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
    index: true,
  })
  status!: CategoryStatus;

  @Prop({ default: false })
  isFeatured!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ displayOrder: 1 });

CategorySchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name);
  } else if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  }
});
