import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from '@modules/categories/schemas/category.schema';
import { Product } from '@modules/products/schemas/product.schema';
import { MediaAsset, MediaAssetSchema } from '@common/schemas/media-asset.schema';

export type EnquiryDocument = HydratedDocument<Enquiry>;

export enum EnquiryStatus {
  NEW = 'new',
  SEEN = 'seen',
  CONTACTED = 'contacted',
  CLOSED = 'closed',
}

export enum EnquirySource {
  HOMEPAGE = 'homepage',
  PRODUCT = 'product',
  CATEGORY = 'category',
  PROJECT = 'project',
  CONTACT = 'contact',
  FLOATING_CTA = 'floating_cta',
  ABOUT = 'about',
  // Submitted from the "Customize this product" form on a product detail
  // page — kept distinct from PRODUCT (the plain "Enquire Now"/"Get Quote"
  // buttons) so the CMS inbox can filter customize requests on their own,
  // since these carry reference images + a product link the plain ones don't.
  CUSTOM_ORDER = 'custom_order',
}

@Schema({ timestamps: true })
export class Enquiry {
  @Prop({ required: true, trim: true, maxlength: 120 })
  fullName!: string;

  @Prop({ required: true, trim: true, maxlength: 15 })
  mobileNumber!: string;

  @Prop({ trim: true, maxlength: 80 })
  state?: string;

  @Prop({ trim: true, maxlength: 80 })
  city?: string;

  @Prop({ type: Types.ObjectId, ref: Category.name, index: true })
  interestedCategory?: Types.ObjectId;

  // Only ever set for source: CUSTOM_ORDER — which product the customer
  // wants customized. Nullable/absent on every other source, same as
  // interestedCategory is for those.
  @Prop({ type: Types.ObjectId, ref: Product.name, index: true })
  interestedProduct?: Types.ObjectId;

  // Reference photos the customer attached showing what they want
  // customized. Capped at MAX_CUSTOM_ORDER_IMAGES (4) in
  // CreateEnquiryDto — not re-enforced at the schema level since Mongoose
  // array props don't have a clean maxlength validator for embedded docs.
  @Prop({ type: [MediaAssetSchema], default: [] })
  referenceImages?: MediaAsset[];

  @Prop({ trim: true, maxlength: 1000 })
  message?: string;

  @Prop({
    type: String,
    enum: EnquiryStatus,
    default: EnquiryStatus.NEW,
    index: true,
  })
  status!: EnquiryStatus;

  @Prop({ type: String, enum: EnquirySource, default: EnquirySource.CONTACT })
  source!: EnquirySource;

  @Prop({ trim: true })
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);

EnquirySchema.index({ createdAt: -1 });
EnquirySchema.index({ mobileNumber: 1 });
