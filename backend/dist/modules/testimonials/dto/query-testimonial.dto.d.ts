import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { TestimonialStatus } from '../schemas/testimonial.schema';
export declare class QueryTestimonialDto extends PaginationQueryDto {
    status?: TestimonialStatus;
    isFeatured?: boolean;
}
