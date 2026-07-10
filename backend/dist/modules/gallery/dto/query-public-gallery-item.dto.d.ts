import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { GalleryItemType } from '../schemas/gallery-item.schema';
export declare class QueryPublicGalleryItemDto extends PaginationQueryDto {
    type?: GalleryItemType;
    tag?: string;
}
