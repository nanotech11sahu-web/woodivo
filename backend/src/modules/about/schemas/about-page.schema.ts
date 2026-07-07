import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';

export type AboutPageDocument = HydratedDocument<AboutPage>;

export const ABOUT_PAGE_SINGLETON_KEY = 'global';

@Schema({ _id: false })
class ValueItem {
  @Prop({ required: true, trim: true, maxlength: 80 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 300 })
  description!: string;
}
const ValueItemSchema = SchemaFactory.createForClass(ValueItem);

@Schema({ _id: false })
class Milestone {
  @Prop({ required: true, trim: true, maxlength: 20 })
  year!: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  title!: string;

  @Prop({ trim: true, maxlength: 300 })
  description?: string;
}
const MilestoneSchema = SchemaFactory.createForClass(Milestone);

@Schema({ _id: false })
class TeamMember {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  role!: string;

  @Prop({ type: MediaAssetSchema })
  photo?: MediaAsset;

  @Prop({ trim: true, maxlength: 400 })
  bio?: string;
}
const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

/**
 * Singleton document, same `key`-based upsert pattern as WebsiteSettings
 * (backend/src/modules/settings/schemas/website-settings.schema.ts) — one
 * About page, no slug/status, lazily created on first read/write.
 *
 * `values`, `milestones` and `teamMembers` are plain embedded arrays with
 * no `displayOrder` field: array position *is* display order, same choice
 * ProductSchema made for `specifications` — reordering happens by editing
 * the array in the CMS form (add/remove), not a separate sort field.
 */
@Schema({ timestamps: true })
export class AboutPage {
  @Prop({ default: ABOUT_PAGE_SINGLETON_KEY, unique: true, index: true })
  key!: string;

  @Prop({ trim: true, maxlength: 150 })
  heroTitle?: string;

  @Prop({ trim: true, maxlength: 300 })
  heroSubtitle?: string;

  @Prop({ type: MediaAssetSchema })
  heroImage?: MediaAsset;

  @Prop({ trim: true, maxlength: 150 })
  storyTitle?: string;

  @Prop({ trim: true, maxlength: 4000 })
  storyContent?: string;

  @Prop({ type: MediaAssetSchema })
  storyImage?: MediaAsset;

  @Prop({ trim: true, maxlength: 2000 })
  missionText?: string;

  @Prop({ trim: true, maxlength: 2000 })
  visionText?: string;

  @Prop({ type: [ValueItemSchema], default: [] })
  values!: ValueItem[];

  @Prop({ type: [MilestoneSchema], default: [] })
  milestones!: Milestone[];

  @Prop({ trim: true, maxlength: 150 })
  teamTitle?: string;

  @Prop({ trim: true, maxlength: 300 })
  teamSubtitle?: string;

  @Prop({ type: [TeamMemberSchema], default: [] })
  teamMembers!: TeamMember[];

  @Prop({ trim: true, maxlength: 150 })
  ctaTitle?: string;

  @Prop({ trim: true, maxlength: 300 })
  ctaText?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AboutPageSchema = SchemaFactory.createForClass(AboutPage);
