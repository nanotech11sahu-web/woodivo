import { Controller, Get } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { SettingsService } from './settings.service';

@Public()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.get();
  }
}
