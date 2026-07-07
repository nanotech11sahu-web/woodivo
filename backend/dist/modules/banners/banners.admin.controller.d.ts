import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';
import { BannerStatus } from './schemas/banner.schema';
export declare class BannersAdminController {
    private readonly bannersService;
    constructor(bannersService: BannersService);
    findAll(query: QueryBannerDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/banner.schema").Banner, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/banner.schema").Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/banner.schema").Banner, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/banner.schema").Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateBannerDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/banner.schema").Banner, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/banner.schema").Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: BannerStatus): Promise<import("mongoose").Document<unknown, {}, import("./schemas/banner.schema").Banner, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/banner.schema").Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateBannerDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/banner.schema").Banner, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/banner.schema").Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
