import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { ProductStatus } from '../schemas/product.schema';
export declare class QueryProductDto extends PaginationQueryDto {
    status?: ProductStatus;
    isFeatured?: boolean;
    category?: string;
}
