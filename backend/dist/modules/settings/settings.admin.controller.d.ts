import { SettingsService } from './settings.service';
import { UpdateWebsiteSettingsDto } from './dto/update-website-settings.dto';
export declare class SettingsAdminController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(): Promise<import("mongoose").Document<unknown, {}, import("./schemas/website-settings.schema").WebsiteSettings, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/website-settings.schema").WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(dto: UpdateWebsiteSettingsDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/website-settings.schema").WebsiteSettings, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/website-settings.schema").WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
