import { ProductsService } from './products.service';
import { QueryPublicProductDto } from './dto/query-public-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: QueryPublicProductDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").Product, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(slug: string): Promise<Record<string, unknown>>;
}
