import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '@common/constants/app.constants';

export type UserDocument = HydratedDocument<User>;

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  email!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.EDITOR,
    index: true,
  })
  role!: UserRole;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    index: true,
  })
  status!: UserStatus;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop()
  lastLoginAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
