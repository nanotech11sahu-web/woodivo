import { Model } from 'mongoose';
import { BannerDocument, BannerPlacement, BannerStatus } from './schemas/banner.schema';
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';
export declare class BannersService {
    private readonly bannerModel;
    constructor(bannerModel: Model<BannerDocument>);
    create(dto: CreateBannerDto): Promise<BannerDocument>;
    findAllAdmin(query: QueryBannerDto): Promise<PaginatedResult<BannerDocument>>;
    findAllPublicByPlacement(placement: BannerPlacement): Promise<BannerDocument[]>;
    findByIdAdmin(id: string): Promise<BannerDocument>;
    update(id: string, dto: UpdateBannerDto): Promise<BannerDocument>;
    remove(id: string): Promise<void>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: BannerStatus): Promise<BannerDocument>;
}
