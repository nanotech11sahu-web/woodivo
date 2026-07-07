import { Controller, Get } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { AboutService } from './about.service';

@Public()
@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  get() {
    return this.aboutService.get();
  }
}
