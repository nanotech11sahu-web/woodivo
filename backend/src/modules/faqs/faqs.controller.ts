import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { FaqsService } from './faqs.service';
import { QueryPublicFaqDto } from './dto/query-public-faq.dto';

@Public()
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  findAll(@Query() query: QueryPublicFaqDto) {
    return this.faqsService.findAllPublic(query);
  }
}
