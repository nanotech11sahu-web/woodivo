import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { SubCategoryStatus } from '../schemas/subcategory.schema';

export class QuerySubCategoryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SubCategoryStatus)
  status?: SubCategoryStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsMongoId()
  category?: string;
}
