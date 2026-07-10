import { EnquirySource } from '../schemas/enquiry.schema';
import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
export declare class CreateEnquiryDto {
    fullName: string;
    mobileNumber: string;
    state?: string;
    city?: string;
    interestedCategory?: string;
    interestedProduct?: string;
    referenceImages?: MediaAssetDto[];
    message?: string;
    source?: EnquirySource;
}
