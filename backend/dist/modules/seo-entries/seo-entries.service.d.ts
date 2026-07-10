import { Model, Types } from 'mongoose';
import { SeoEntryDocument, SeoPageType } from './schemas/seo-entry.schema';
import { SeoMetaDto } from "../../common/dto/seo-meta.dto";
import { CreateSeoEntryDto } from './dto/create-seo-entry.dto';
import { QuerySeoEntryDto } from './dto/query-seo-entry.dto';
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
declare const STATIC_PAGES: {
    path: string;
    pageType: SeoPageType;
    entityLabel: string;
}[];
export declare class SeoEntriesService {
    private readonly seoEntryModel;
    constructor(seoEntryModel: Model<SeoEntryDocument>);
    findAllAdmin(query: QuerySeoEntryDto): Promise<PaginatedResult<SeoEntryDocument>>;
    findByIdAdmin(id: string): Promise<SeoEntryDocument>;
    findByPath(path: string): Promise<SeoEntryDocument | null>;
    update(id: string, dto: SeoMetaDto): Promise<SeoEntryDocument>;
    createCustom(dto: CreateSeoEntryDto): Promise<SeoEntryDocument>;
    remove(id: string): Promise<void>;
    syncForEntity(params: {
        pageType: (typeof STATIC_PAGES)[number]['pageType'];
        entityId: Types.ObjectId | string;
        entityLabel: string;
        path: string;
    }): Promise<void>;
    removeForEntity(pageType: SeoPageType, entityId: Types.ObjectId | string): Promise<void>;
    ensureStaticPages(): Promise<void>;
    private normalizePath;
}
export {};
