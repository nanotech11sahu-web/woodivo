import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { ContactInfoDto } from './contact-info.dto';
import { SocialLinksDto } from './social-links.dto';
import { FooterSettingsDto } from './footer-settings.dto';
import { HomepageSettingsDto } from './homepage-settings.dto';

export class UpdateWebsiteSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  siteName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  logo?: MediaAssetDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  favicon?: MediaAssetDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact?: ContactInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FooterSettingsDto)
  footer?: FooterSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HomepageSettingsDto)
  homepage?: HomepageSettingsDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  facebookPixelId?: string;
}
