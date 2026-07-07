import { Model } from 'mongoose';
import { BlogCategoryDocument, BlogDocument } from './schemas/blog.schema';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
export declare class BlogCategoriesService {
    private readonly blogCategoryModel;
    private readonly blogModel;
    constructor(blogCategoryModel: Model<BlogCategoryDocument>, blogModel: Model<BlogDocument>);
    create(dto: CreateBlogCategoryDto): Promise<BlogCategoryDocument>;
    findAll(): Promise<BlogCategoryDocument[]>;
    findByIdAdmin(id: string): Promise<BlogCategoryDocument>;
    update(id: string, dto: UpdateBlogCategoryDto): Promise<BlogCategoryDocument>;
    remove(id: string): Promise<void>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    private ensureSlugAvailable;
}
