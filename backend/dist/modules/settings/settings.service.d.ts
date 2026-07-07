import { Model } from 'mongoose';
import { WebsiteSettingsDocument } from './schemas/website-settings.schema';
import { UpdateWebsiteSettingsDto } from './dto/update-website-settings.dto';
export declare class SettingsService {
    private readonly settingsModel;
    constructor(settingsModel: Model<WebsiteSettingsDocument>);
    get(): Promise<WebsiteSettingsDocument>;
    update(dto: UpdateWebsiteSettingsDto): Promise<WebsiteSettingsDocument>;
}
