import type { CloudinaryClient } from './providers/cloudinary.provider';
import { MediaFolder } from "../../common/constants/app.constants";
import { MediaAssetDto } from "../../common/dto/media-asset.dto";
import type { QueryMediaDto } from './dto/query-media.dto';
export interface MediaLibraryAsset {
    publicId: string;
    url: string;
    folder: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
    createdAt: string;
}
export interface MediaLibraryResult {
    items: MediaLibraryAsset[];
    nextCursor: string | null;
    totalCount: number;
}
export declare class MediaService {
    private readonly cloudinary;
    constructor(cloudinary: CloudinaryClient);
    uploadImage(file: Express.Multer.File, folder: MediaFolder, alt?: string): Promise<MediaAssetDto>;
    uploadImages(files: Express.Multer.File[], folder: MediaFolder): Promise<MediaAssetDto[]>;
    deleteImage(publicId: string): Promise<{
        deleted: boolean;
    }>;
    listAssets(query: QueryMediaDto): Promise<MediaLibraryResult>;
    private buildSearchExpression;
    private toLibraryAsset;
    private streamUpload;
}
