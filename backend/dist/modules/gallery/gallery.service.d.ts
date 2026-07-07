import { Model } from 'mongoose';
import { GalleryItemDocument, GalleryItemStatus } from './schemas/gallery-item.schema';
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { CreateManyGalleryItemsDto } from './dto/create-many-gallery-items.dto';
import { QueryGalleryItemDto } from './dto/query-gallery-item.dto';
import { QueryPublicGalleryItemDto } from './dto/query-public-gallery-item.dto';
export declare class GalleryService {
    private readonly galleryItemModel;
    constructor(galleryItemModel: Model<GalleryItemDocument>);
    create(dto: CreateGalleryItemDto): Promise<GalleryItemDocument>;
    createMany(dto: CreateManyGalleryItemsDto): Promise<GalleryItemDocument[]>;
    findAllAdmin(query: QueryGalleryItemDto): Promise<PaginatedResult<GalleryItemDocument>>;
    findAllPublic(query: QueryPublicGalleryItemDto): Promise<PaginatedResult<GalleryItemDocument>>;
    findByIdAdmin(id: string): Promise<GalleryItemDocument>;
    update(id: string, dto: UpdateGalleryItemDto): Promise<GalleryItemDocument>;
    remove(id: string): Promise<void>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: GalleryItemStatus): Promise<GalleryItemDocument>;
}
