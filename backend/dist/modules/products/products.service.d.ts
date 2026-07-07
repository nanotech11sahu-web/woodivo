import { Model } from 'mongoose';
import { ProductDocument, ProductStatus } from './schemas/product.schema';
import { CategoryDocument } from "../categories/schemas/category.schema";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { SeoEntriesService } from "../seo-entries/seo-entries.service";
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { QueryPublicProductDto } from './dto/query-public-product.dto';
export declare class ProductsService {
    private readonly productModel;
    private readonly categoryModel;
    private readonly seoEntriesService;
    constructor(productModel: Model<ProductDocument>, categoryModel: Model<CategoryDocument>, seoEntriesService: SeoEntriesService);
    create(dto: CreateProductDto): Promise<ProductDocument>;
    findAllAdmin(query: QueryProductDto): Promise<PaginatedResult<ProductDocument>>;
    findAllPublic(query: QueryPublicProductDto): Promise<PaginatedResult<ProductDocument>>;
    findByIdAdmin(id: string): Promise<ProductDocument>;
    findBySlugPublic(slug: string): Promise<ProductDocument>;
    update(id: string, dto: UpdateProductDto): Promise<ProductDocument>;
    remove(id: string): Promise<void>;
    setStatus(id: string, status: ProductStatus): Promise<ProductDocument>;
    private getCategoryOrThrow;
    private ensureRelatedProductsExist;
    private syncSeoEntry;
    private ensureSlugAvailable;
}
