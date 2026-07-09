import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { EnquirySource } from '../schemas/enquiry.schema';

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

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsEnum(EnquirySource)
  source?: EnquirySource;
}
