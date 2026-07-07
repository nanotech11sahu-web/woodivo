import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { GalleryService } from './gallery.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { CreateManyGalleryItemsDto } from './dto/create-many-gallery-items.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { QueryGalleryItemDto } from './dto/query-gallery-item.dto';
import { GalleryItemStatus } from './schemas/gallery-item.schema';
export declare class GalleryAdminController {
    private readonly galleryService;
    constructor(galleryService: GalleryService);
    findAll(query: QueryGalleryItemDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/gallery-item.schema").GalleryItem, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/gallery-item.schema").GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/gallery-item.schema").GalleryItem, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/gallery-item.schema").GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateGalleryItemDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/gallery-item.schema").GalleryItem, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/gallery-item.schema").GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    createMany(dto: CreateManyGalleryItemsDto): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/gallery-item.schema").GalleryItem, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/gallery-item.schema").GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: GalleryItemStatus): Promise<import("mongoose").Document<unknown, {}, import("./schemas/gallery-item.schema").GalleryItem, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/gallery-item.schema").GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateGalleryItemDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/gallery-item.schema").GalleryItem, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/gallery-item.schema").GalleryItem & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
