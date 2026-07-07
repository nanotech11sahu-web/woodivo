import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { QueryTestimonialDto } from './dto/query-testimonial.dto';
import { TestimonialStatus } from './schemas/testimonial.schema';
export declare class TestimonialsAdminController {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    findAll(query: QueryTestimonialDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/testimonial.schema").Testimonial, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/testimonial.schema").Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/testimonial.schema").Testimonial, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/testimonial.schema").Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateTestimonialDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/testimonial.schema").Testimonial, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/testimonial.schema").Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: TestimonialStatus): Promise<import("mongoose").Document<unknown, {}, import("./schemas/testimonial.schema").Testimonial, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/testimonial.schema").Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateTestimonialDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/testimonial.schema").Testimonial, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/testimonial.schema").Testimonial & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
