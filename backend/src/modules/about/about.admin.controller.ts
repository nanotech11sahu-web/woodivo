import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { AboutService } from './about.service';
import { UpdateAboutPageDto } from './dto/update-about-page.dto';

@Controller('admin/about')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AboutAdminController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  get() {
    return this.aboutService.get();
  }

  @Patch()
  update(@Body() dto: UpdateAboutPageDto) {
    return this.aboutService.update(dto);
  }
}
