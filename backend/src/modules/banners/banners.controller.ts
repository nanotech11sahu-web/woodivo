import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { BannersService } from './banners.service';
import { BannerPlacement } from './schemas/banner.schema';

@Public()
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findAll(@Query('placement') placement?: BannerPlacement) {
    if (!placement || !Object.values(BannerPlacement).includes(placement)) {
      throw new BadRequestException(
        `A valid "placement" query param is required (one of: ${Object.values(BannerPlacement).join(', ')})`,
      );
    }
    return this.bannersService.findAllPublicByPlacement(placement);
  }
}
