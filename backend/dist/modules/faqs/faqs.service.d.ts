import { Model } from 'mongoose';
import { FaqDocument, FaqStatus } from './schemas/faq.schema';
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { QueryFaqDto } from './dto/query-faq.dto';
import { QueryPublicFaqDto } from './dto/query-public-faq.dto';
export declare class FaqsService {
    private readonly faqModel;
    constructor(faqModel: Model<FaqDocument>);
    create(dto: CreateFaqDto): Promise<FaqDocument>;
    findAllAdmin(query: QueryFaqDto): Promise<PaginatedResult<FaqDocument>>;
    findAllPublic(query: QueryPublicFaqDto): Promise<PaginatedResult<FaqDocument>>;
    findByIdAdmin(id: string): Promise<FaqDocument>;
    update(id: string, dto: UpdateFaqDto): Promise<FaqDocument>;
    remove(id: string): Promise<void>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: FaqStatus): Promise<FaqDocument>;
}
