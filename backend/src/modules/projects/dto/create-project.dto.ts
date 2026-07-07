import { Type } from 'class-transformer';
import {
  IsArray,
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
import { ProjectStatus } from '../schemas/project.schema';

export class CreateProjectDto {
  @IsString()
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug may only contain lowercase letters, numbers and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  completionYear?: string;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  coverImage?: MediaAssetDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaAssetDto)
  images?: MediaAssetDto[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
