import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { BlogStatus } from '../schemas/blog.schema';
import { BlogFaqItemDto } from './blog-faq-item.dto';

export class CreateBlogDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug may only contain lowercase letters, numbers and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  excerpt?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  featuredImage?: MediaAssetDto;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsDateString()
  publishAt?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  authorName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaAssetDto)
  images?: MediaAssetDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogFaqItemDto)
  faqs?: BlogFaqItemDto[];
}
