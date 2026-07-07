import { FaqsService } from './faqs.service';
import { QueryPublicFaqDto } from './dto/query-public-faq.dto';
export declare class FaqsController {
    private readonly faqsService;
    constructor(faqsService: FaqsService);
    findAll(query: QueryPublicFaqDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/faq.schema").Faq, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/faq.schema").Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
}
