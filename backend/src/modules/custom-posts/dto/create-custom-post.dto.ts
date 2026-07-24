import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { CustomPostStatus } from '../schemas/custom-post.schema';

export class CreateCustomPostDto {
  @IsString()
  @MaxLength(150)
  title!: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one image is required' })
  @ArrayMaxSize(10, { message: 'A post can carry at most 10 images' })
  @ValidateNested({ each: true })
  @Type(() => MediaAssetDto)
  images!: MediaAssetDto[];

  @IsString()
  caption!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  cta?: string;

  @IsOptional()
  @IsEnum(CustomPostStatus)
  status?: CustomPostStatus;
}
