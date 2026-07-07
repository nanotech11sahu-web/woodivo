import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { FaqStatus } from '../schemas/faq.schema';

export class QueryFaqDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(FaqStatus)
  status?: FaqStatus;

  @IsOptional()
  @IsString()
  group?: string;
}
