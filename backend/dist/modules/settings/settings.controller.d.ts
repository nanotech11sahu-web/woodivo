import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(): Promise<import("mongoose").Document<unknown, {}, import("./schemas/website-settings.schema").WebsiteSettings, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/website-settings.schema").WebsiteSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
