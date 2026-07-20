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
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { SpecificationItemDto } from '@common/dto/specification-item.dto';
import { ProductStatus, ProductStockStatus } from '../schemas/product.schema';
import { ProductFaqItemDto } from './product-faq-item.dto';

export class CreateProductDto {
  @IsMongoId()
  category!: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subCategories?: string[];

  @IsString()
  @MaxLength(150)
  name!: string;

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

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  // Must be lower than `price` — cross-field check happens in
  // ProductsService (needs the resolved `price`, which DTO-level
  // validators alone can't reliably compare against on partial updates).
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  sku?: string;

  @IsOptional()
  @IsEnum(ProductStockStatus)
  stockStatus?: ProductStockStatus;

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
