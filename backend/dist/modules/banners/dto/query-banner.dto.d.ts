import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { BannerPlacement, BannerStatus } from '../schemas/banner.schema';
export declare class QueryBannerDto extends PaginationQueryDto {
    status?: BannerStatus;
    placement?: BannerPlacement;
}
