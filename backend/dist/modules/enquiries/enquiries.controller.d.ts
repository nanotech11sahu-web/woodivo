import { MediaService } from "../media/media.service";
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
export declare class EnquiriesController {
    private readonly enquiriesService;
    private readonly mediaService;
    constructor(enquiriesService: EnquiriesService, mediaService: MediaService);
    create(dto: CreateEnquiryDto): Promise<{
        id: import("mongoose").Types.ObjectId;
        fullName: string;
        submittedAt: Date | undefined;
    }>;
    uploadImages(files: Express.Multer.File[]): Promise<import("../../common/dto/media-asset.dto").MediaAssetDto[]>;
}
