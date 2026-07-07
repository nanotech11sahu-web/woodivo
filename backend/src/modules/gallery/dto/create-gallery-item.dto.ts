import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import {
  GalleryItemStatus,
  GalleryItemType,
} from '../schemas/gallery-item.schema';

export class CreateGalleryItemDto {
  @ValidateNested()
  @Type(() => MediaAssetDto)
  media!: MediaAssetDto;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  caption?: string;

  @IsOptional()
  @IsEnum(GalleryItemType)
  type?: GalleryItemType;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(GalleryItemStatus)
  status?: GalleryItemStatus;
}
