import { SeoEntriesService } from './seo-entries.service';
export declare class SeoEntriesController {
    private readonly seoEntriesService;
    constructor(seoEntriesService: SeoEntriesService);
    resolve(path?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/seo-entry.schema").SeoEntry, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/seo-entry.schema").SeoEntry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
}
