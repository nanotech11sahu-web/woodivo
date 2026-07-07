import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { ValueItemDto } from './value-item.dto';
import { MilestoneDto } from './milestone.dto';
import { TeamMemberDto } from './team-member.dto';

export class UpdateAboutPageDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  heroTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  heroSubtitle?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  heroImage?: MediaAssetDto;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  storyTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  storyContent?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  storyImage?: MediaAssetDto;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  missionText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  visionText?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueItemDto)
  values?: ValueItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  teamTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  teamSubtitle?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  ctaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  ctaText?: string;
}
