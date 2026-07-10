import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
import { CategoryStatus } from '../schemas/category.schema';
export declare class UpdateCategoryDto {
    name?: string;
    slug?: string;
    banner?: MediaAssetDto;
    thumbnail?: MediaAssetDto;
    description?: string;
    displayOrder?: number;
    status?: CategoryStatus;
    isFeatured?: boolean;
}
