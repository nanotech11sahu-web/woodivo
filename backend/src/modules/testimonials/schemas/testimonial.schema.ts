import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';

export type TestimonialDocument = HydratedDocument<Testimonial>;

export enum TestimonialStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true, trim: true, maxlength: 120 })
  clientName!: string;

  @Prop({ trim: true, maxlength: 100 })
  clientLocation?: string;

  @Prop({ trim: true, maxlength: 80 })
  projectType?: string;

  @Prop({ type: MediaAssetSchema })
  clientPhoto?: MediaAsset;

  @Prop({ required: true, trim: true, maxlength: 1200 })
  testimonialText!: string;

  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({
    type: String,
    enum: TestimonialStatus,
    default: TestimonialStatus.ACTIVE,
    index: true,
  })
  status!: TestimonialStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);

TestimonialSchema.index({ displayOrder: 1 });
