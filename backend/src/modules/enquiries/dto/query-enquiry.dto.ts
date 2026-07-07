import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { EnquirySource, EnquiryStatus } from '../schemas/enquiry.schema';

export class QueryEnquiryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @IsEnum(EnquirySource)
  source?: EnquirySource;

  @IsOptional()
  @IsMongoId()
  category?: string;
}
