import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FaqDocument = HydratedDocument<Faq>;

export enum FaqStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true, trim: true, maxlength: 300 })
  question!: string;

  @Prop({ required: true, trim: true })
  answer!: string;

  @Prop({ trim: true, maxlength: 80, index: true })
  group?: string;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({
    type: String,
    enum: FaqStatus,
    default: FaqStatus.ACTIVE,
    index: true,
  })
  status!: FaqStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);

FaqSchema.index({ displayOrder: 1 });
