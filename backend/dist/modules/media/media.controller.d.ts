import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    list(query: QueryMediaDto): Promise<import("./media.service").MediaLibraryResult>;
    upload(file: Express.Multer.File, dto: UploadMediaDto): Promise<import("../../common/dto/media-asset.dto").MediaAssetDto>;
    uploadMultiple(files: Express.Multer.File[], dto: UploadMediaDto): Promise<import("../../common/dto/media-asset.dto").MediaAssetDto[]>;
    delete(dto: DeleteMediaDto): Promise<{
        deleted: boolean;
    }>;
}
