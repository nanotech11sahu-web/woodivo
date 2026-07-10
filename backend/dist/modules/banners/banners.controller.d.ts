import { BannersService } from './banners.service';
import { BannerPlacement } from './schemas/banner.schema';
export declare class BannersController {
    private readonly bannersService;
    constructor(bannersService: BannersService);
    findAll(placement?: BannerPlacement): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/banner.schema").Banner, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/banner.schema").Banner & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
