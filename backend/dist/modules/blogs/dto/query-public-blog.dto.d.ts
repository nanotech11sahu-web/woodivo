import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
export declare class QueryPublicBlogDto extends PaginationQueryDto {
    category?: string;
    tag?: string;
}
