import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { SeoPageType } from '../schemas/seo-entry.schema';

export class QuerySeoEntryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SeoPageType)
  pageType?: SeoPageType;
}
