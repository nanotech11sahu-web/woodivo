import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MediaAssetDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  publicId?: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;
}
