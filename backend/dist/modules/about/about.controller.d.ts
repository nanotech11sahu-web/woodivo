import { AboutService } from './about.service';
export declare class AboutController {
    private readonly aboutService;
    constructor(aboutService: AboutService);
    get(): Promise<import("mongoose").Document<unknown, {}, import("./schemas/about-page.schema").AboutPage, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/about-page.schema").AboutPage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
