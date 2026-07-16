import { IsOptional, IsString } from 'class-validator';

export class QueryPublicSubCategoryDto {
  // Category slug — public callers filter subcategories by the category's
  // slug, not its ObjectId, same convention as QueryPublicProductDto.
  @IsOptional()
  @IsString()
  category?: string;
}
