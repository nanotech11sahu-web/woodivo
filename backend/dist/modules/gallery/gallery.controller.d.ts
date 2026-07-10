import { GalleryService } from './gallery.service';
import { QueryPublicGalleryItemDto } from './dto/query-public-gallery-item.dto';
export declare class GalleryController {
    private readonly galleryService;
    constructor(galleryService: GalleryService);
    findAll(query: QueryPublicGalleryItemDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/gallery-item.schema").GalleryItem, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/gallery-item.schema").GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
}
