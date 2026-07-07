"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./schemas/product.schema");
const category_schema_1 = require("../categories/schemas/category.schema");
const slugify_1 = require("../../common/utils/slugify");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
const seo_entries_service_1 = require("../seo-entries/seo-entries.service");
const seo_entry_schema_1 = require("../seo-entries/schemas/seo-entry.schema");
const CATEGORY_POPULATE_FIELDS = 'name slug thumbnail status';
let ProductsService = class ProductsService {
    productModel;
    categoryModel;
    seoEntriesService;
    constructor(productModel, categoryModel, seoEntriesService) {
        this.productModel = productModel;
        this.categoryModel = categoryModel;
        this.seoEntriesService = seoEntriesService;
    }
    async create(dto) {
        const category = await this.getCategoryOrThrow(dto.category);
        const slug = (0, slugify_1.slugify)(dto.slug || dto.name);
        await this.ensureSlugAvailable(slug);
        await this.ensureRelatedProductsExist(dto.relatedProducts);
        const product = new this.productModel({
            ...dto,
            category: category._id,
            slug,
        });
        const saved = await product.save();
        await this.syncSeoEntry(saved);
        return saved;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, search, status, isFeatured, category, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (typeof isFeatured === 'boolean')
            filter.isFeatured = isFeatured;
        if (category)
            filter.category = new mongoose_2.Types.ObjectId(category);
        if (search)
            filter.$text = { $search: search };
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.productModel
                .find(filter)
                .populate('category', CATEGORY_POPULATE_FIELDS)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.productModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findAllPublic(query) {
        const { page = 1, limit = 20, search, category, featured, sortBy = 'displayOrder', sortOrder = 'asc', } = query;
        const filter = {
            status: product_schema_1.ProductStatus.ACTIVE,
        };
        if (typeof featured === 'boolean')
            filter.isFeatured = featured;
        if (search)
            filter.$text = { $search: search };
        if (category) {
            const categoryDoc = await this.categoryModel
                .findOne({ slug: (0, slugify_1.slugify)(category), status: category_schema_1.CategoryStatus.ACTIVE })
                .exec();
            if (!categoryDoc) {
                return { items: [], meta: (0, paginated_result_interface_1.buildPaginationMeta)(0, page, limit) };
            }
            filter.category = categoryDoc._id;
        }
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.productModel
                .find(filter)
                .populate('category', CATEGORY_POPULATE_FIELDS)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.productModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findByIdAdmin(id) {
        const product = await this.productModel
            .findById(id)
            .populate('category', CATEGORY_POPULATE_FIELDS)
            .populate('relatedProducts', 'name slug images status')
            .exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async findBySlugPublic(slug) {
        const product = await this.productModel
            .findOne({ slug: (0, slugify_1.slugify)(slug), status: product_schema_1.ProductStatus.ACTIVE })
            .populate('category', CATEGORY_POPULATE_FIELDS)
            .populate({
            path: 'relatedProducts',
            match: { status: product_schema_1.ProductStatus.ACTIVE },
            select: 'name slug images',
        })
            .exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async update(id, dto) {
        const product = await this.productModel.findById(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (dto.category) {
            const category = await this.getCategoryOrThrow(dto.category);
            product.category = category._id;
        }
        if (dto.slug || dto.name) {
            const nextSlug = (0, slugify_1.slugify)(dto.slug || dto.name || product.slug);
            if (nextSlug !== product.slug) {
                await this.ensureSlugAvailable(nextSlug, id);
                product.slug = nextSlug;
            }
        }
        if (dto.relatedProducts) {
            await this.ensureRelatedProductsExist(dto.relatedProducts, id);
        }
        Object.assign(product, {
            ...dto,
            category: product.category,
            slug: product.slug,
        });
        const saved = await product.save();
        await this.syncSeoEntry(saved);
        return saved;
    }
    async remove(id) {
        const product = await this.productModel.findById(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        await this.productModel.updateMany({ relatedProducts: product._id }, { $pull: { relatedProducts: product._id } });
        await this.productModel.deleteOne({ _id: product._id });
        await this.seoEntriesService.removeForEntity(seo_entry_schema_1.SeoPageType.PRODUCT, product._id);
    }
    async setStatus(id, status) {
        const product = await this.productModel.findById(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        product.status = status;
        return product.save();
    }
    async getCategoryOrThrow(categoryId) {
        const category = await this.categoryModel.findById(categoryId).exec();
        if (!category) {
            throw new common_1.BadRequestException(`Category "${categoryId}" does not exist`);
        }
        return category;
    }
    async ensureRelatedProductsExist(ids, excludeId) {
        if (!ids?.length)
            return;
        if (excludeId && ids.includes(excludeId)) {
            throw new common_1.BadRequestException('A product cannot relate to itself');
        }
        const count = await this.productModel.countDocuments({
            _id: { $in: ids },
        });
        if (count !== new Set(ids).size) {
            throw new common_1.BadRequestException('One or more relatedProducts ids do not exist');
        }
    }
    async syncSeoEntry(product) {
        await this.seoEntriesService.syncForEntity({
            pageType: seo_entry_schema_1.SeoPageType.PRODUCT,
            entityId: product._id,
            entityLabel: product.name,
            path: `/products/${product.slug}`,
        });
    }
    async ensureSlugAvailable(slug, excludeId) {
        const filter = { slug };
        if (excludeId)
            filter._id = { $ne: excludeId };
        const existing = await this.productModel.exists(filter);
        if (existing) {
            throw new common_1.ConflictException(`Product slug "${slug}" is already in use`);
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        seo_entries_service_1.SeoEntriesService])
], ProductsService);
//# sourceMappingURL=products.service.js.map