import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
export declare class BlogsAdminController {
    private readonly blogsService;
    constructor(blogsService: BlogsService);
    findAll(query: QueryBlogDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").Blog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").Blog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateBlogDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").Blog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateBlogDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/blog.schema").Blog, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/blog.schema").Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
