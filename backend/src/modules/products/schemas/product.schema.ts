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
import { SubCategory } from '@modules/subcategories/schemas/subcategory.schema';
import { Blog } from '@modules/blogs/schemas/blog.schema';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ProductStockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  MADE_TO_ORDER = 'made_to_order',
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

  // A product can belong to zero, one, or several subcategories within its
  // category (enforced in ProductsService, not here, since Mongoose can't
  // cross-check refs). Empty array means "no subcategory assigned" — same
  // meaning the old singular `subCategory` had when unset.
  @Prop({
    type: [{ type: Types.ObjectId, ref: SubCategory.name }],
    default: [],
    index: true,
  })
  subCategories!: Types.ObjectId[];

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

  // Base selling price. Required — every product is shown with a price on
  // the storefront now, even though pieces remain made-to-order/quote-
  // adjustable in practice (see ProductFaqEditor defaults for the
  // customization language that still applies).
  @Prop({ required: true, min: 0, index: true })
  price!: number;

  // Optional discounted price. When set it must be lower than `price`
  // (enforced in the pre-save hook below and in the DTOs) — the storefront
  // shows it struck-through against `price`.
  @Prop({ min: 0 })
  discountPrice?: number;

  // Kept in sync with price/discountPrice on every save so price-range
  // filtering and price sorting can query a single indexed field instead
  // of an `$or`/`$expr` across two — mirrors the "shown" price a customer
  // actually sees (the discount price when present, else the base price).
  @Prop({ min: 0, index: true })
  effectivePrice!: number;

  @Prop({ trim: true, uppercase: true, maxlength: 40 })
  sku?: string;

  @Prop({
    type: String,
    enum: ProductStockStatus,
    default: ProductStockStatus.MADE_TO_ORDER,
  })
  stockStatus!: ProductStockStatus;

  // Set by the one-off `migrate-product-pricing` script for any product
  // that predates `price` becoming required — it got a placeholder price
  // rather than being left broken, and this flags it so the CMS can find
  // and correct it. Never set on normal create/update; cleared
  // automatically the next time someone explicitly saves a `price` for
  // this product (see ProductsService.update()).
  @Prop({ default: false, index: true })
  needsPriceReview!: boolean;

  // Set by the one-off `migrate-subcategory` script for any product it
  // couldn't confidently auto-assign a subcategory to (name matched zero
  // or multiple subcategories under its category). subCategories itself
  // stays legitimately optional otherwise — this only flags the ones the
  // migration skipped so the CMS can find and resolve them by hand.
  // Cleared automatically the next time someone explicitly saves
  // subCategories for this product (see ProductsService.update()).
  @Prop({ default: false, index: true })
  needsSubCategoryReview!: boolean;

  // Incremented on every public product-detail view — backs the "Popular"
  // sort option (see ProductsService.findAllPublic).
  @Prop({ default: 0, index: true })
  viewCount!: number;

  // Incremented whenever an enquiry naming this product is submitted —
  // there's no checkout/cart on this site, so this is the closest signal
  // to a "purchase"/order intent and backs the "Most Purchased" sort
  // option (see EnquiriesService.create).
  @Prop({ default: 0, index: true })
  purchaseCount!: number;

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
ProductSchema.index({ subCategories: 1, status: 1 });
ProductSchema.index({ status: 1, effectivePrice: 1 });
ProductSchema.index({ status: 1, viewCount: -1 });
ProductSchema.index({ status: 1, purchaseCount: -1 });

ProductSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name);
  } else if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  }

  if (
    typeof this.discountPrice === 'number' &&
    this.discountPrice >= this.price
  ) {
    // A discount price that isn't actually lower than price is not a
    // discount — drop it rather than reject the save, so a CMS editor
    // clearing/raising price after setting a discount doesn't get stuck.
    this.discountPrice = undefined;
  }

  this.effectivePrice =
    typeof this.discountPrice === 'number' ? this.discountPrice : this.price;
});
