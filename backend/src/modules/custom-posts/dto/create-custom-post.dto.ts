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
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { CustomPostStatus } from '../schemas/custom-post.schema';

export class CreateCustomPostDto {
  @IsString()
  @MaxLength(150)
  title!: string;

  // Required unless `video` is provided instead - see the class-level check
  // in CustomPostsService.create (Mongoose validators can't easily express
  // "one of these two fields", so that's enforced in the service).
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'A post can carry at most 10 images' })
  @ValidateNested({ each: true })
  @Type(() => MediaAssetDto)
  images?: MediaAssetDto[];

  // A single video asset - mutually exclusive with `images`. Set this to
  // post as an Instagram/Facebook Reel instead of a normal image post.
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  video?: MediaAssetDto;

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
