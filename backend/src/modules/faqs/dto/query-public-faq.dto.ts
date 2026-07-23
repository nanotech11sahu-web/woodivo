import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

export class QueryPublicFaqDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  lang?: string;
}
