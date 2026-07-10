import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EnquirySource } from '../schemas/enquiry.schema';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { MAX_CUSTOM_ORDER_IMAGES } from '@common/constants/app.constants';

export class CreateEnquiryDto {
  @IsString()
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @Matches(/^[+]?[0-9]{10,15}$/, {
    message: 'mobileNumber must be a valid phone number (10-15 digits)',
  })
  mobileNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  interestedCategory?: string; // category slug, resolved server-side

  // Product slug, resolved server-side — only meaningful when source is
  // CUSTOM_ORDER, but not restricted to it at the DTO level (same
  // "unknown/inactive is not fatal" treatment as interestedCategory).
  @IsOptional()
  @IsString()
  interestedProduct?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_CUSTOM_ORDER_IMAGES, {
    message: `referenceImages accepts at most ${MAX_CUSTOM_ORDER_IMAGES} images`,
  })
  @ValidateNested({ each: true })
  @Type(() => MediaAssetDto)
  referenceImages?: MediaAssetDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsEnum(EnquirySource)
  source?: EnquirySource;
}
