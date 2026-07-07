import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { BlogStatus } from '../schemas/blog.schema';
export declare class QueryBlogDto extends PaginationQueryDto {
    status?: BlogStatus;
    category?: string;
    isFeatured?: boolean;
}
