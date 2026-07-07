import { BlogsService } from './blogs.service';
import { BlogCategoriesService } from './blog-categories.service';
import { QueryPublicBlogDto } from './dto/query-public-blog.dto';
export declare class BlogsController {
    private readonly blogsService;
    private readonly blogCategoriesService;
    constructor(blogsService: BlogsService, blogCategoriesService: BlogCategoriesService);
    findAll(query: QueryPublicBlogDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").Blog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findLatest(limit?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").Blog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findCategories(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").BlogCategory, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").BlogCategory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(slug: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").Blog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
