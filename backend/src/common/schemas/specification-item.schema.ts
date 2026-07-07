import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class SpecificationItem {
  @Prop({ required: true, trim: true })
  key!: string;

  @Prop({ required: true, trim: true })
  value!: string;
}

export const SpecificationItemSchema =
  SchemaFactory.createForClass(SpecificationItem);
