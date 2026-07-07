import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';
import { slugify } from '@common/utils/slugify';

export type BlogDocument = HydratedDocument<Blog>;

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
}

// ─── Blog Category (lightweight — not the product Category) ─────────────────

@Schema({ timestamps: true })
export class BlogCategory {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  slug!: string;

  @Prop({ default: 0 })
  displayOrder!: number;
}

export type BlogCategoryDocument = HydratedDocument<BlogCategory>;

export const BlogCategorySchema = SchemaFactory.createForClass(BlogCategory);

BlogCategorySchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name);
  } else if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  }
});

// ─── Blog FAQ item (embedded, per-post — not the site-wide FaqSchema in
// modules/faqs, which is a separate collection for homepage FAQs) ──────────

@Schema({ _id: false })
export class BlogFaqItem {
  @Prop({ required: true, trim: true, maxlength: 300 })
  question!: string;

  @Prop({ required: true, trim: true })
  answer!: string;
}

export const BlogFaqItemSchema = SchemaFactory.createForClass(BlogFaqItem);

// ─── Blog ────────────────────────────────────────────────────────────────────

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  slug!: string;

  @Prop({ trim: true, maxlength: 300 })
  excerpt?: string;

  // Markdown. Bold, bullets, and in-body `![alt](url)` images all live in
  // this one string — no separate rich-text/block model needed. Every
  // pre-existing plain-text post (paragraphs separated by blank lines) is
  // already valid Markdown, so this required no data migration when the
  // frontend renderer changed.
  @Prop({ required: true })
  content!: string;

  @Prop({ type: MediaAssetSchema })
  featuredImage?: MediaAsset;

  // Upload bucket the writer draws on when referencing images inline in
  // `content` — keeps Cloudinary uploads tracked against this document even
  // if a URL never makes it into the Markdown body. Not rendered directly;
  // `featuredImage` remains the one image used for cards/listings/OG.
  @Prop({ type: [MediaAssetSchema], default: [] })
  images!: MediaAsset[];

  @Prop({ type: [BlogFaqItemSchema], default: [] })
  faqs!: BlogFaqItem[];

  @Prop({ type: String, ref: BlogCategory.name, index: true })
  category?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({
    type: String,
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
    index: true,
  })
  status!: BlogStatus;

  @Prop({ index: true })
  publishAt?: Date;

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ trim: true, maxlength: 100 })
  authorName?: string;

  @Prop({ default: 0 })
  viewCount!: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.index({ status: 1, publishAt: -1 });
BlogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

BlogSchema.pre('save', function () {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title);
  } else if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  }
});
