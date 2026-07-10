import { TestimonialsService } from './testimonials.service';
import { QueryPublicTestimonialDto } from './dto/query-public-testimonial.dto';
export declare class TestimonialsController {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    findAll(query: QueryPublicTestimonialDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/testimonial.schema").Testimonial, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/testimonial.schema").Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
}
