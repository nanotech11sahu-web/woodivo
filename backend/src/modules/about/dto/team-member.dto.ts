import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';

export class TeamMemberDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(100)
  role!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  photo?: MediaAssetDto;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  bio?: string;
}
