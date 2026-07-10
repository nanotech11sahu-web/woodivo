import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
import { GalleryItemStatus, GalleryItemType } from '../schemas/gallery-item.schema';
export declare class CreateGalleryItemDto {
    media: MediaAssetDto;
    caption?: string;
    type?: GalleryItemType;
    tags?: string[];
    displayOrder?: number;
    status?: GalleryItemStatus;
}
