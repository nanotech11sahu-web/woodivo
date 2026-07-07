import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class SocialLinks {
  @Prop({ trim: true }) facebook?: string;
  @Prop({ trim: true }) instagram?: string;
  @Prop({ trim: true }) youtube?: string;
  @Prop({ trim: true }) pinterest?: string;
  @Prop({ trim: true }) linkedin?: string;
  @Prop({ trim: true }) twitter?: string;
}

export const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);
