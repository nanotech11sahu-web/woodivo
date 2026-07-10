import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { CategoryStatus } from '../schemas/category.schema';
export declare class QueryCategoryDto extends PaginationQueryDto {
    status?: CategoryStatus;
    isFeatured?: boolean;
}
