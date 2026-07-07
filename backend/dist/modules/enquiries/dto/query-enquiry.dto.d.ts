import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { EnquirySource, EnquiryStatus } from '../schemas/enquiry.schema';
export declare class QueryEnquiryDto extends PaginationQueryDto {
    status?: EnquiryStatus;
    source?: EnquirySource;
    category?: string;
}
