import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

export class QueryPublicCustomizationDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  category?: string; // category slug, resolved server-side

  @IsOptional()
  @IsString()
  tag?: string;
}
