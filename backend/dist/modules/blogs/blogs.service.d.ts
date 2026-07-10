import { Model } from 'mongoose';
import { BlogCategoryDocument, BlogDocument } from './schemas/blog.schema';
import { ProductDocument } from "../products/schemas/product.schema";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { SeoEntriesService } from "../seo-entries/seo-entries.service";
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { QueryPublicBlogDto } from './dto/query-public-blog.dto';
export declare class BlogsService {
    private readonly blogModel;
    private readonly blogCategoryModel;
    private readonly productModel;
    private readonly seoEntriesService;
    constructor(blogModel: Model<BlogDocument>, blogCategoryModel: Model<BlogCategoryDocument>, productModel: Model<ProductDocument>, seoEntriesService: SeoEntriesService);
    create(dto: CreateBlogDto): Promise<BlogDocument>;
    findAllAdmin(query: QueryBlogDto): Promise<PaginatedResult<BlogDocument>>;
    findAllPublic(query: QueryPublicBlogDto): Promise<PaginatedResult<BlogDocument>>;
    findLatestPublic(limit?: number): Promise<BlogDocument[]>;
    findByIdAdmin(id: string): Promise<BlogDocument>;
    findBySlugPublic(slug: string): Promise<BlogDocument>;
    update(id: string, dto: UpdateBlogDto): Promise<BlogDocument>;
    remove(id: string): Promise<void>;
    private syncSeoEntry;
    private publishedFilter;
    private getCategoryOrThrow;
    private ensureSlugAvailable;
}
