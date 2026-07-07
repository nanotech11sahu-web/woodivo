import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { GalleryItemStatus, GalleryItemType } from '../schemas/gallery-item.schema';
export declare class QueryGalleryItemDto extends PaginationQueryDto {
    status?: GalleryItemStatus;
    type?: GalleryItemType;
    tag?: string;
}
