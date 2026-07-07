import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { SeoPageType } from '../schemas/seo-entry.schema';
export declare class QuerySeoEntryDto extends PaginationQueryDto {
    pageType?: SeoPageType;
}
