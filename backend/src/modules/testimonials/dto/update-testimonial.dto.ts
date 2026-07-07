import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { TestimonialStatus } from '../schemas/testimonial.schema';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  projectType?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  clientPhoto?: MediaAssetDto;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  testimonialText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(TestimonialStatus)
  status?: TestimonialStatus;
}
