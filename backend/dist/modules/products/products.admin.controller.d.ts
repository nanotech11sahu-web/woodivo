import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductStatus } from './schemas/product.schema';
export declare class ProductsAdminController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: QueryProductDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").Product, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").Product, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateProductDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").Product, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    setStatus(id: string, status: ProductStatus): Promise<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").Product, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").Product, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
