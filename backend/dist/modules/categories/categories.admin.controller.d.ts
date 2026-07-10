import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { CategoryStatus } from './schemas/category.schema';
export declare class CategoriesAdminController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(query: QueryCategoryDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/category.schema").Category, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/category.schema").Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/category.schema").Category, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/category.schema").Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/category.schema").Category, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/category.schema").Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    reorder(dto: ReorderCategoriesDto): Promise<void>;
    setStatus(id: string, status: CategoryStatus): Promise<import("mongoose").Document<unknown, {}, import("./schemas/category.schema").Category, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/category.schema").Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/category.schema").Category, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/category.schema").Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
