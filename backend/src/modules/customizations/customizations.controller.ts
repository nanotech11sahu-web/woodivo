import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { CustomizationsService } from './customizations.service';
import { QueryPublicCustomizationDto } from './dto/query-public-customization.dto';

@Public()
@Controller('customizations')
export class CustomizationsController {
  constructor(private readonly customizationsService: CustomizationsService) {}

  @Get()
  findAll(@Query() query: QueryPublicCustomizationDto) {
    return this.customizationsService.findAllPublic(query);
  }
}
