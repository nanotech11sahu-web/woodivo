import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SeoEntryDocument = HydratedDocument<SeoEntry>;

// One value per static route the frontend renders without a :slug, plus
// one per dynamic content type, plus CUSTOM for anything an admin adds by
// hand that isn't backed by a content entity at all.
export enum SeoPageType {
  HOME = 'home',
  ABOUT = 'about',
  CONTACT = 'contact',
  GALLERY = 'gallery',
  BLOGS_LISTING = 'blogs-listing',
  PRODUCT = 'product',
  BLOG = 'blog',
  CATEGORY = 'category',
  SUBCATEGORY = 'subcategory',
  CUSTOM = 'custom',
}

// Every entity-backed page type maps 1:1 to one of these — kept as a
// standalone list (rather than deriving it from the enum at runtime) so
// it reads as an explicit contract at the call site in SeoEntriesService.
export const ENTITY_PAGE_TYPES = [
  SeoPageType.PRODUCT,
  SeoPageType.BLOG,
  SeoPageType.CATEGORY,
  SeoPageType.SUBCATEGORY,
] as const;

@Schema({ timestamps: true })
export class SeoEntry {
  // The frontend route this entry controls, e.g. `/`, `/about`,
  // `/products/teak-dining-table`. This is the lookup key the public
  // `GET /seo/resolve` endpoint uses — always normalized (leading slash,
  // no trailing slash except for `/` itself) before it's ever compared or
  // stored, see `SeoEntriesService.normalizePath()`.
  @Prop({ required: true, unique: true, trim: true, index: true })
  path!: string;

  @Prop({ type: String, enum: SeoPageType, required: true, index: true })
  pageType!: SeoPageType;

  // Which Product/Blog/Category document this entry mirrors, so a
  // rename (slug or title change) can find its existing row by identity
  // rather than by the path that's in the middle of changing. Absent for
  // static pages and admin-added CUSTOM entries.
  @Prop({ type: Types.ObjectId })
  entityId?: Types.ObjectId;

  // Denormalized product/blog/category name, purely so the CMS's
  // SEO list table has something readable to show per row without a join.
  @Prop({ trim: true })
  entityLabel?: string;

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

  createdAt?: Date;
  updatedAt?: Date;
}

export const SeoEntrySchema = SchemaFactory.createForClass(SeoEntry);

SeoEntrySchema.index({ entityId: 1, pageType: 1 });
