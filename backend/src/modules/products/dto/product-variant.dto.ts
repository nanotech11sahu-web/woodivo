import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MediaAssetDto } from '@common/dto/media-asset.dto';
import { ProductStockStatus } from '../schemas/product.schema';

/** Per-product size/finish option, embedded on the product document —
 * see `ProductVariant` in schemas/product.schema.ts for why this exists
 * alongside the top-level price/sku fields rather than replacing them. */
export class ProductVariantDto {
  @IsString()
  @MaxLength(200)
  label!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

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
  @ValidateNested()
  @Type(() => MediaAssetDto)
  image?: MediaAssetDto;
}
