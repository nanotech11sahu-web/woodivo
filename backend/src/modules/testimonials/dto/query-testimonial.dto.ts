import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { TestimonialStatus } from '../schemas/testimonial.schema';

export class QueryTestimonialDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TestimonialStatus)
  status?: TestimonialStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;
}
