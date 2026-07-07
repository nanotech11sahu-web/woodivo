import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  MediaAsset,
  MediaAssetSchema,
} from '@common/schemas/media-asset.schema';
import { slugify } from '@common/utils/slugify';
import { Category } from '@modules/categories/schemas/category.schema';

export type ProjectDocument = HydratedDocument<Project>;

export enum ProjectStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true, maxlength: 150 })
  title!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  slug!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true, maxlength: 100 })
  clientName?: string;

  @Prop({ trim: true, maxlength: 100 })
  location?: string;

  @Prop({ trim: true, maxlength: 50 })
  completionYear?: string;

  @Prop({ type: Types.ObjectId, ref: Category.name, index: true })
  category?: Types.ObjectId;

  @Prop({ type: MediaAssetSchema })
  coverImage?: MediaAsset;

  @Prop({ type: [MediaAssetSchema], default: [] })
  images!: MediaAsset[];

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
    index: true,
  })
  status!: ProjectStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ displayOrder: 1 });
ProjectSchema.index({ title: 'text', description: 'text' });

ProjectSchema.pre('save', function () {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title);
  } else if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  }
});
