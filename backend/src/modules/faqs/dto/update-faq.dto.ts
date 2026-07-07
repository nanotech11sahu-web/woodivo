import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { FaqStatus } from '../schemas/faq.schema';

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  group?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(FaqStatus)
  status?: FaqStatus;
}
