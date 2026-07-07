import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { CategoryStatus } from '../schemas/category.schema';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug may only contain lowercase letters, numbers and hyphens',
  })
  slug?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  banner?: MediaAssetDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  thumbnail?: MediaAssetDto;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
