import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { QueryFaqDto } from './dto/query-faq.dto';
import { FaqStatus } from './schemas/faq.schema';
export declare class FaqsAdminController {
    private readonly faqsService;
    constructor(faqsService: FaqsService);
    findAll(query: QueryFaqDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/faq.schema").Faq, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/faq.schema").Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/faq.schema").Faq, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/faq.schema").Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateFaqDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/faq.schema").Faq, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/faq.schema").Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: FaqStatus): Promise<import("mongoose").Document<unknown, {}, import("./schemas/faq.schema").Faq, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/faq.schema").Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateFaqDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/faq.schema").Faq, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/faq.schema").Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
