import { Model } from 'mongoose';
import { CategoryDocument, CategoryStatus } from './schemas/category.schema';
import { ProductDocument } from "../products/schemas/product.schema";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { SeoEntriesService } from "../seo-entries/seo-entries.service";
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
export declare class CategoriesService {
    private readonly categoryModel;
    private readonly productModel;
    private readonly seoEntriesService;
    constructor(categoryModel: Model<CategoryDocument>, productModel: Model<ProductDocument>, seoEntriesService: SeoEntriesService);
    create(dto: CreateCategoryDto): Promise<CategoryDocument>;
    findAllAdmin(query: QueryCategoryDto): Promise<PaginatedResult<CategoryDocument>>;
    findAllPublic(featuredOnly?: boolean): Promise<CategoryDocument[]>;
    findByIdAdmin(id: string): Promise<CategoryDocument>;
    findBySlugPublic(slug: string): Promise<CategoryDocument>;
    update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument>;
    remove(id: string): Promise<void>;
    reorder(dto: ReorderCategoriesDto): Promise<void>;
    setStatus(id: string, status: CategoryStatus): Promise<CategoryDocument>;
    private syncSeoEntry;
    private ensureSlugAvailable;
}
