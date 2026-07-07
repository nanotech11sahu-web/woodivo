import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WebsiteSettings,
  WebsiteSettingsSchema,
} from './schemas/website-settings.schema';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingsAdminController } from './settings.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebsiteSettings.name, schema: WebsiteSettingsSchema },
    ]),
  ],
  controllers: [SettingsController, SettingsAdminController],
  providers: [SettingsService],
  exports: [MongooseModule, SettingsService],
})
export class SettingsModule {}
