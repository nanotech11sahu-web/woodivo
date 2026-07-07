import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
export declare class EnquiriesController {
    private readonly enquiriesService;
    constructor(enquiriesService: EnquiriesService);
    create(dto: CreateEnquiryDto): Promise<{
        id: import("mongoose").Types.ObjectId;
        fullName: string;
        submittedAt: Date | undefined;
    }>;
}
