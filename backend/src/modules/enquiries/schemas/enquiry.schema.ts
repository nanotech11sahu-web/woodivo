import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from '@modules/categories/schemas/category.schema';

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
