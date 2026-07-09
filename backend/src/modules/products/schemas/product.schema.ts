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
import { Blog } from '@modules/blogs/schemas/blog.schema';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// ─── Product FAQ item (embedded, per-product — mirrors BlogFaqItem in
// modules/blogs/schemas/blog.schema.ts; not the site-wide FaqSchema in
// modules/faqs, which is a separate collection for homepage FAQs) ──────────

@Schema({ _id: false })
export class ProductFaqItem {
  @Prop({ required: true, trim: true, maxlength: 300 })
  question!: string;

  @Prop({ required: true, trim: true })
  answer!: string;
}

export const ProductFaqItemSchema = SchemaFactory.createForClass(ProductFaqItem);

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

  // Internal linking to relevant blog posts — surfaced on the product
  // detail page and in JSON-LD-adjacent content, same intent as
  // `relatedProducts` but pointing at Blog documents instead.
  @Prop({ type: [{ type: Types.ObjectId, ref: Blog.name }], default: [] })
  relatedBlogs!: Types.ObjectId[];

  @Prop({ type: [ProductFaqItemSchema], default: [] })
  faqs!: ProductFaqItem[];

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
