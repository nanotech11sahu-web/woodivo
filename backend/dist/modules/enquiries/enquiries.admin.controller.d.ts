import { EnquiriesService } from './enquiries.service';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { QueryEnquiryDto } from './dto/query-enquiry.dto';
export declare class EnquiriesAdminController {
    private readonly enquiriesService;
    constructor(enquiriesService: EnquiriesService);
    findAll(query: QueryEnquiryDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/enquiry.schema").Enquiry, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/enquiry.schema").Enquiry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    getStats(): Promise<import("./enquiries.service").EnquiryStatsSummary>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/enquiry.schema").Enquiry, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/enquiry.schema").Enquiry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateEnquiryDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/enquiry.schema").Enquiry, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/enquiry.schema").Enquiry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
