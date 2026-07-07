import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { SettingsService } from './settings.service';
import { UpdateWebsiteSettingsDto } from './dto/update-website-settings.dto';

@Controller('admin/settings')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class SettingsAdminController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.get();
  }

  @Patch()
  update(@Body() dto: UpdateWebsiteSettingsDto) {
    return this.settingsService.update(dto);
  }
}
