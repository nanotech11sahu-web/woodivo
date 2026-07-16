import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';
import { slugify } from '@common/utils/slugify';
import { Category } from '@modules/categories/schemas/category.schema';

export type SubCategoryDocument = HydratedDocument<SubCategory>;

export enum SubCategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class SubCategory {
  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
    index: true,
  })
  category!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  // Unique globally (not just per-category) so public lookups by slug
  // alone (`GET /subcategories/:slug`) stay unambiguous — mirrors how
  // Category.slug is uniqued, see categories/schemas/category.schema.ts.
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
    enum: SubCategoryStatus,
    default: SubCategoryStatus.ACTIVE,
    index: true,
  })
  status!: SubCategoryStatus;

  @Prop({ default: false })
  isFeatured!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

SubCategorySchema.index({ category: 1, displayOrder: 1 });
SubCategorySchema.index({ category: 1, status: 1 });

SubCategorySchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name);
  } else if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  }
});
