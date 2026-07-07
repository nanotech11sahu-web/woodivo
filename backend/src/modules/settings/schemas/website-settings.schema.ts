import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';
import {
  SocialLinks,
  SocialLinksSchema,
} from '@common/schemas/social-links.schema';

export type WebsiteSettingsDocument = HydratedDocument<WebsiteSettings>;

export const SETTINGS_SINGLETON_KEY = 'global';

@Schema({ _id: false })
class ContactInfo {
  @Prop({ trim: true }) phone?: string;
  @Prop({ trim: true }) whatsapp?: string;
  @Prop({ trim: true }) email?: string;
  @Prop({ trim: true }) address?: string;
  @Prop({ trim: true }) city?: string;
  @Prop({ trim: true }) state?: string;
  @Prop({ trim: true }) pincode?: string;
  @Prop({ trim: true }) googleMapEmbedUrl?: string;
}

@Schema({ _id: false })
class FooterSettings {
  @Prop({ trim: true, maxlength: 500 }) aboutText?: string;
  @Prop({ trim: true }) copyrightText?: string;
}

// Phase 29's homepage content module. A fixed, curated set of icon keys
// rather than a freeform string — `whyWoodivoPoints` ends up rendered by
// the frontend as a `lucide-react` icon component, and trusting an
// arbitrary CMS-entered string as a dynamic import/lookup key is both a
// fragile UX (typo = missing icon, no validation feedback) and an
// unnecessary attack surface for a value stored straight into Mongo.
// Kebab-case rather than the PascalCase lucide-react export names so the
// enum documents intent independent of that library's naming, and so the
// frontend's icon map (`lib/homepage-icons.ts`) is an explicit, reviewable
// translation table rather than a `Icons[value]` string-indexed lookup
// into the whole exported surface of `lucide-react`.
export enum HomepageHighlightIcon {
  TREE_PINE = 'tree-pine',
  RULER = 'ruler',
  HAMMER = 'hammer',
  TRUCK = 'truck',
  SHIELD_CHECK = 'shield-check',
  AWARD = 'award',
  LEAF = 'leaf',
  CLOCK = 'clock',
  THUMBS_UP = 'thumbs-up',
  PEN_TOOL = 'pen-tool',
  PACKAGE = 'package',
  USERS = 'users',
}

// Same `{ _id: false }` embedded-array shape `SpecificationItem`
// (common/schemas) already established for Product — a title/description
// pair (plus an icon here) with no identity of its own outside its parent
// document, reordered by array position rather than a `displayOrder`
// field since there's no separate collection/endpoint to sort against.
@Schema({ _id: false })
class HomepageHighlight {
  @Prop({ type: String, enum: HomepageHighlightIcon, required: true })
  icon!: HomepageHighlightIcon;

  @Prop({ required: true, trim: true, maxlength: 80 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  description!: string;
}

const HomepageHighlightSchema = SchemaFactory.createForClass(HomepageHighlight);

@Schema({ _id: false })
class HomepageSettings {
  // Powers `WhyWoodivoSection` on the public site — was a hardcoded
  // `POINTS` array in `why-woodivo-section.tsx` until this phase. Empty
  // by default (fresh install), same "no fabricated content" discipline
  // every other optional array on this schema follows; the frontend falls
  // back to its old hardcoded four points only when this is empty, never
  // the other way round.
  @Prop({ type: [HomepageHighlightSchema], default: [] })
  whyWoodivoPoints?: HomepageHighlight[];
}

const HomepageSettingsSchema = SchemaFactory.createForClass(HomepageSettings);

@Schema({ timestamps: true })
export class WebsiteSettings {
  @Prop({ default: SETTINGS_SINGLETON_KEY, unique: true, index: true })
  key!: string;

  @Prop({ trim: true, maxlength: 80 })
  siteName?: string;

  @Prop({ trim: true, maxlength: 200 })
  tagline?: string;

  @Prop({ type: MediaAssetSchema })
  logo?: MediaAsset;

  @Prop({ type: MediaAssetSchema })
  favicon?: MediaAsset;

  @Prop({ type: ContactInfo, default: {} })
  contact?: ContactInfo;

  @Prop({ type: SocialLinksSchema, default: {} })
  socialLinks?: SocialLinks;

  @Prop({ type: FooterSettings, default: {} })
  footer?: FooterSettings;

  @Prop({ type: HomepageSettingsSchema, default: {} })
  homepage?: HomepageSettings;

  @Prop({ trim: true, maxlength: 500 })
  googleAnalyticsId?: string;

  @Prop({ trim: true, maxlength: 500 })
  facebookPixelId?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WebsiteSettingsSchema =
  SchemaFactory.createForClass(WebsiteSettings);
