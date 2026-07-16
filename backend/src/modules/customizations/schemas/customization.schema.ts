import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';
import { Category } from '@modules/categories/schemas/category.schema';

export type CustomizationDocument = HydratedDocument<Customization>;

export enum CustomizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * A showcase entry for a piece Woodivo has already built to a customer's
 * custom request — title, photos and a short story of what was changed
 * (wood, size, finish, an added detail). Deliberately its own collection
 * rather than a flag on Product: these aren't catalog items with a price
 * or a buy flow, they're portfolio proof shown on the public "Customize"
 * page to reassure a visitor before they fill out the request form below
 * it. Managed in the CMS the same way Blog/Gallery/Product content is —
 * list, create, edit, reorder, publish/unpublish, delete.
 */
@Schema({ timestamps: true })
export class Customization {
  @Prop({ required: true, trim: true, maxlength: 150 })
  title!: string;

  @Prop({ trim: true, maxlength: 1000 })
  description?: string;

  @Prop({ type: [MediaAssetSchema], default: [] })
  images!: MediaAsset[];

  // Optional link to the product category this custom piece is closest
  // to (e.g. "Dining Tables") — purely descriptive/filterable, same
  // relationship shape as Blog.category, not a catalog reference.
  @Prop({ type: Types.ObjectId, ref: Category.name, index: true })
  category?: Types.ObjectId;

  // Freeform labels like the wood/finish used ("teak", "walnut inlay") —
  // same shape and purpose as GalleryItem.tags.
  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({
    type: String,
    enum: CustomizationStatus,
    default: CustomizationStatus.ACTIVE,
    index: true,
  })
  status!: CustomizationStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CustomizationSchema = SchemaFactory.createForClass(Customization);

CustomizationSchema.index({ displayOrder: 1 });
CustomizationSchema.index({ title: 'text', tags: 'text' });
