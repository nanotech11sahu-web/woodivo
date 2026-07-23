import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { TranslationService } from '@modules/translation/translation.service';
import { FaqsService } from './faqs.service';
import { QueryPublicFaqDto } from './dto/query-public-faq.dto';

@Public()
@Controller('faqs')
export class FaqsController {
  constructor(
    private readonly faqsService: FaqsService,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  async findAll(@Query() query: QueryPublicFaqDto) {
    const result = await this.faqsService.findAllPublic(query);
    const items = await this.translationService.translateList(
      result.items,
      ['question', 'answer'],
      query.lang ?? 'en',
    );
    return { ...result, items };
  }
}
