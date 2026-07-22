import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { SpecificationItemDto } from '@common/dto/specification-item.dto';
import { ProductStatus, ProductStockStatus } from '../schemas/product.schema';
import { ProductFaqItemDto } from './product-faq-item.dto';
import { ProductVariantDto } from './product-variant.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsMongoId()
  category?: string;

  // An empty array explicitly clears every subcategory (e.g. after
  // switching to a category the current ones don't belong to); omitting
  // the field entirely leaves it untouched.
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subCategories?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug may only contain lowercase letters, numbers and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MediaAssetDto)
  images?: MediaAssetDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificationItemDto)
  specifications?: SpecificationItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  // `null` explicitly clears a previously-set discount; omitting the
  // field leaves it untouched. Cross-checked against the resolved
  // `price` in ProductsService, same reasoning as CreateProductDto.
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountPrice?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  sku?: string;

  @IsOptional()
  @IsEnum(ProductStockStatus)
  stockStatus?: ProductStockStatus;

  // Empty array explicitly clears every variant; omitting the field
  // leaves existing variants untouched — same convention as
  // `subCategories` above.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  relatedProducts?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  relatedBlogs?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFaqItemDto)
  faqs?: ProductFaqItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
