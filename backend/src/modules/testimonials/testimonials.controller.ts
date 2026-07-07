import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { TestimonialsService } from './testimonials.service';
import { QueryPublicTestimonialDto } from './dto/query-public-testimonial.dto';

@Public()
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findAll(@Query() query: QueryPublicTestimonialDto) {
    return this.testimonialsService.findAllPublic(query);
  }
}
