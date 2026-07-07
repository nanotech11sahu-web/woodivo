import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';
import {
  SpecificationItem,
  SpecificationItemSchema,
} from '@common/schemas/specification-item.schema';
import { slugify } from '@common/utils/slugify';
import { Category } from '@modules/categories/schemas/category.schema';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Product {
  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
    index: true,
  })
  category!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 150 })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  slug!: string;

  @Prop({ type: [MediaAssetSchema], default: [] })
  images!: MediaAsset[];

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [SpecificationItemSchema], default: [] })
  specifications!: SpecificationItem[];

  @Prop({ default: false, index: true })
  isFeatured!: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: Product.name }], default: [] })
  relatedProducts!: Types.ObjectId[];

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({
    type: String,
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
    index: true,
  })
  status!: ProductStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1, status: 1 });

ProductSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name);
  } else if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  }
});
