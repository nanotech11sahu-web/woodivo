import { EnquirySource } from '../schemas/enquiry.schema';
export declare class CreateEnquiryDto {
    fullName: string;
    mobileNumber: string;
    city?: string;
    interestedCategory?: string;
    message?: string;
    source?: EnquirySource;
}
