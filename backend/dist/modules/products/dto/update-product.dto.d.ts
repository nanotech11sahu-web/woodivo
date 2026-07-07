import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
import { SpecificationItemDto } from "../../../common/dto/specification-item.dto";
import { ProductStatus } from '../schemas/product.schema';
export declare class UpdateProductDto {
    category?: string;
    name?: string;
    slug?: string;
    images?: MediaAssetDto[];
    description?: string;
    specifications?: SpecificationItemDto[];
    isFeatured?: boolean;
    relatedProducts?: string[];
    displayOrder?: number;
    status?: ProductStatus;
}
