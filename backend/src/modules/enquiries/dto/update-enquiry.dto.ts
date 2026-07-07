import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EnquiryStatus } from '../schemas/enquiry.schema';

export class UpdateEnquiryDto {
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
