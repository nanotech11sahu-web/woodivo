import { SeoMetaDto } from "../../common/dto/seo-meta.dto";
import { SeoEntriesService } from './seo-entries.service';
import { CreateSeoEntryDto } from './dto/create-seo-entry.dto';
import { QuerySeoEntryDto } from './dto/query-seo-entry.dto';
export declare class SeoEntriesAdminController {
    private readonly seoEntriesService;
    constructor(seoEntriesService: SeoEntriesService);
    findAll(query: QuerySeoEntryDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/seo-entry.schema").SeoEntry, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/seo-entry.schema").SeoEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/seo-entry.schema").SeoEntry, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/seo-entry.schema").SeoEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateSeoEntryDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/seo-entry.schema").SeoEntry, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/seo-entry.schema").SeoEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: SeoMetaDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/seo-entry.schema").SeoEntry, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/seo-entry.schema").SeoEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
