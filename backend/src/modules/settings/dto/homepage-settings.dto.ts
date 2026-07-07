import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { HomepageHighlightIcon } from '../schemas/website-settings.schema';

// Mirrors common/dto/specification-item.dto.ts's shape (a required-field
// DTO validated with `ValidateNested({ each: true })` from its parent),
// just with an `icon` enum in place of a free-text `key`.
export class HomepageHighlightDto {
  @IsEnum(HomepageHighlightIcon)
  icon!: HomepageHighlightIcon;

  @IsString()
  @MaxLength(80)
  title!: string;

  @IsString()
  @MaxLength(200)
  description!: string;
}

export class HomepageSettingsDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => HomepageHighlightDto)
  whyWoodivoPoints?: HomepageHighlightDto[];
}
