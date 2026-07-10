import { Model } from 'mongoose';
import { TestimonialDocument, TestimonialStatus } from './schemas/testimonial.schema';
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { QueryTestimonialDto } from './dto/query-testimonial.dto';
import { QueryPublicTestimonialDto } from './dto/query-public-testimonial.dto';
export declare class TestimonialsService {
    private readonly testimonialModel;
    constructor(testimonialModel: Model<TestimonialDocument>);
    create(dto: CreateTestimonialDto): Promise<TestimonialDocument>;
    findAllAdmin(query: QueryTestimonialDto): Promise<PaginatedResult<TestimonialDocument>>;
    findAllPublic(query: QueryPublicTestimonialDto): Promise<PaginatedResult<TestimonialDocument>>;
    findByIdAdmin(id: string): Promise<TestimonialDocument>;
    update(id: string, dto: UpdateTestimonialDto): Promise<TestimonialDocument>;
    remove(id: string): Promise<void>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: TestimonialStatus): Promise<TestimonialDocument>;
}
