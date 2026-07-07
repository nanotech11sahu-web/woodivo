import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SETTINGS_SINGLETON_KEY,
  WebsiteSettings,
  WebsiteSettingsDocument,
} from './schemas/website-settings.schema';
import { UpdateWebsiteSettingsDto } from './dto/update-website-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(WebsiteSettings.name)
    private readonly settingsModel: Model<WebsiteSettingsDocument>,
  ) {}

  /**
   * There is exactly one settings document, keyed by SETTINGS_SINGLETON_KEY.
   * Lazily created on first read/write via upsert rather than requiring a
   * seeder entry to exist up front.
   */
  async get(): Promise<WebsiteSettingsDocument> {
    const settings = await this.settingsModel
      .findOneAndUpdate(
        { key: SETTINGS_SINGLETON_KEY },
        { $setOnInsert: { key: SETTINGS_SINGLETON_KEY } },
        { upsert: true, new: true },
      )
      .exec();
    return settings;
  }

  async update(
    dto: UpdateWebsiteSettingsDto,
  ): Promise<WebsiteSettingsDocument> {
    const settings = await this.settingsModel
      .findOneAndUpdate(
        { key: SETTINGS_SINGLETON_KEY },
        { $set: dto },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
    return settings;
  }
}
