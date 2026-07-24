import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';

export type CustomPostDocument = HydratedDocument<CustomPost>;

export enum CustomPostStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
}

/**
 * A CMS-only social post: one or more images plus the caption/brief used to
 * post to Facebook/Instagram, with no relationship to any Product or Blog.
 * Never exposed on the public storefront - admin/custom-posts is its only
 * surface, and it deliberately carries no slug/SEO-for-website fields (see
 * SeoEntry for that, which this is not).
 */
@Schema({ timestamps: true })
export class CustomPost {
  // Internal label only - shown in the CMS list, never posted verbatim.
  @Prop({ required: true, trim: true, maxlength: 150 })
  title!: string;

  @Prop({ type: [MediaAssetSchema], default: [] })
  images!: MediaAsset[];

  // Single video asset for the "Post as Reel" flow - mutually exclusive with
  // `images` at the form level (see custom-post-form-page.tsx); a post
  // either carries images (posted as a normal/carousel post) or a video
  // (posted as a Reel), never both.
  @Prop({ type: MediaAssetSchema })
  video?: MediaAsset;

  // The social caption/brief - what the user called "SEO for social media".
  @Prop({ required: true, trim: true })
  caption!: string;

  @Prop({ type: [String], default: [] })
  keywords!: string[];

  @Prop({ trim: true })
  tone?: string;

  @Prop({ trim: true })
  cta?: string;

  @Prop({
    type: String,
    enum: CustomPostStatus,
    default: CustomPostStatus.DRAFT,
    index: true,
  })
  status!: CustomPostStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CustomPostSchema = SchemaFactory.createForClass(CustomPost);
