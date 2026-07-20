import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

export enum PublicProductSort {
  FEATURED = 'featured',
  LATEST = 'latest',
  POPULAR = 'popular',
  MOST_PURCHASED = 'most-purchased',
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
  NAME_ASC = 'name-asc',
  NAME_DESC = 'name-desc',
}

export class QueryPublicProductDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  category?: string; // category slug

  // Filters to products that have at least one of these subcategories (by
  // slug) among their (possibly several) assigned subcategories. Accepts a
  // single slug or a comma-separated list (Amazon-style multi-select
  // sidebar filter on the storefront).
  @IsOptional()
  @IsString()
  subCategory?: string; // subcategory slug, or comma-separated slugs

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  // Friendly, storefront-facing sort — mapped to an actual field + order
  // in ProductsService.findAllPublic. Distinct from the raw `sortBy`/
  // `sortOrder` pair PaginationQueryDto exposes (still used by the CMS's
  // admin listing), since public callers shouldn't need to know internal
  // field names like `effectivePrice`/`viewCount`.
  @IsOptional()
  @IsEnum(PublicProductSort)
  sort?: PublicProductSort;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
