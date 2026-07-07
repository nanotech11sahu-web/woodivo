import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { FaqStatus } from '../schemas/faq.schema';
export declare class QueryFaqDto extends PaginationQueryDto {
    status?: FaqStatus;
    group?: string;
}
