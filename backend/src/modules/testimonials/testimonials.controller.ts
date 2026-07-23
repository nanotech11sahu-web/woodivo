import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { TranslationService } from '@modules/translation/translation.service';
import { TestimonialsService } from './testimonials.service';
import { QueryPublicTestimonialDto } from './dto/query-public-testimonial.dto';

@Public()
@Controller('testimonials')
export class TestimonialsController {
  constructor(
    private readonly testimonialsService: TestimonialsService,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  async findAll(@Query() query: QueryPublicTestimonialDto) {
    const result = await this.testimonialsService.findAllPublic(query);
    const items = await this.translationService.translateList(
      result.items,
      ['testimonialText'],
      query.lang ?? 'en',
    );
    return { ...result, items };
  }
}
