import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(featured?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/category.schema").Category, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/category.schema").Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(slug: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/category.schema").Category, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/category.schema").Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
