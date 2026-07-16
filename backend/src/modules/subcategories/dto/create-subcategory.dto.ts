import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { SubCategoryStatus } from '../schemas/subcategory.schema';

export class CreateSubCategoryDto {
  @IsMongoId()
  category!: string;

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
  @IsEnum(SubCategoryStatus)
  status?: SubCategoryStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
