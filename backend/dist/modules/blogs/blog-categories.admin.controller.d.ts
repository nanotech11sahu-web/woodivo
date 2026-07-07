import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { BlogCategoriesService } from './blog-categories.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
export declare class BlogCategoriesAdminController {
    private readonly blogCategoriesService;
    constructor(blogCategoriesService: BlogCategoriesService);
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").BlogCategory, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").BlogCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").BlogCategory, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").BlogCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateBlogCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").BlogCategory, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").BlogCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    update(id: string, dto: UpdateBlogCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").BlogCategory, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").BlogCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
