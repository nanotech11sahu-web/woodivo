import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

export class QueryPublicProductDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  category?: string; // category slug

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;
}
