import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ProductStatus } from '../schemas/product.schema';

export class QueryProductDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsMongoId()
  category?: string;

  // Filters to products that have this subcategory among their (possibly
  // several) assigned subcategories.
  @IsOptional()
  @IsMongoId()
  subCategory?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  needsPriceReview?: boolean;
}
