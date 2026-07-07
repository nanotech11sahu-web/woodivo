import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { BannerPlacement, BannerStatus } from '../schemas/banner.schema';

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  desktopImage?: MediaAssetDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  mobileImage?: MediaAssetDto;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  ctaLink?: string;

  @IsOptional()
  @IsEnum(BannerPlacement)
  placement?: BannerPlacement;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(BannerStatus)
  status?: BannerStatus;
}
