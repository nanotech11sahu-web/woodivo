import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
export declare class QueryPublicProductDto extends PaginationQueryDto {
    category?: string;
    featured?: boolean;
}
