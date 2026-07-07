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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const category_schema_1 = require("./schemas/category.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const slugify_1 = require("../../common/utils/slugify");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
const seo_entries_service_1 = require("../seo-entries/seo-entries.service");
const seo_entry_schema_1 = require("../seo-entries/schemas/seo-entry.schema");
let CategoriesService = class CategoriesService {
    categoryModel;
    productModel;
    seoEntriesService;
    constructor(categoryModel, productModel, seoEntriesService) {
        this.categoryModel = categoryModel;
        this.productModel = productModel;
        this.seoEntriesService = seoEntriesService;
    }
    async create(dto) {
        const slug = (0, slugify_1.slugify)(dto.slug || dto.name);
        await this.ensureSlugAvailable(slug);
        const category = new this.categoryModel({ ...dto, slug });
        const saved = await category.save();
        await this.syncSeoEntry(saved);
        return saved;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, search, status, isFeatured, sortBy = 'displayOrder', sortOrder = 'asc', } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (typeof isFeatured === 'boolean')
            filter.isFeatured = isFeatured;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.categoryModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.categoryModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findAllPublic(featuredOnly = false) {
        const filter = {
            status: category_schema_1.CategoryStatus.ACTIVE,
        };
        if (featuredOnly)
            filter.isFeatured = true;
        return this.categoryModel.find(filter).sort({ displayOrder: 1 }).exec();
    }
    async findByIdAdmin(id) {
        const category = await this.categoryModel.findById(id).exec();
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return category;
    }
    async findBySlugPublic(slug) {
        const category = await this.categoryModel
            .findOne({ slug: (0, slugify_1.slugify)(slug), status: category_schema_1.CategoryStatus.ACTIVE })
            .exec();
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return category;
    }
    async update(id, dto) {
        const category = await this.findByIdAdmin(id);
        if (dto.slug || dto.name) {
            const nextSlug = (0, slugify_1.slugify)(dto.slug || dto.name || category.slug);
            if (nextSlug !== category.slug) {
                await this.ensureSlugAvailable(nextSlug, id);
                category.slug = nextSlug;
            }
        }
        Object.assign(category, {
            ...dto,
            slug: category.slug,
        });
        const saved = await category.save();
        await this.syncSeoEntry(saved);
        return saved;
    }
    async remove(id) {
        const category = await this.findByIdAdmin(id);
        const productCount = await this.productModel.countDocuments({
            category: category._id,
        });
        if (productCount > 0) {
            throw new common_1.ConflictException(`Cannot delete category: ${productCount} product(s) still reference it. Reassign or remove them first.`);
        }
        await this.categoryModel.deleteOne({ _id: category._id });
        await this.seoEntriesService.removeForEntity(seo_entry_schema_1.SeoPageType.CATEGORY, category._id);
    }
    async reorder(dto) {
        const operations = dto.items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { $set: { displayOrder: item.displayOrder } },
            },
        }));
        await this.categoryModel.bulkWrite(operations);
    }
    async setStatus(id, status) {
        const category = await this.findByIdAdmin(id);
        category.status = status;
        return category.save();
    }
    async syncSeoEntry(category) {
        await this.seoEntriesService.syncForEntity({
            pageType: seo_entry_schema_1.SeoPageType.CATEGORY,
            entityId: category._id,
            entityLabel: category.name,
            path: `/categories/${category.slug}`,
        });
    }
    async ensureSlugAvailable(slug, excludeId) {
        const filter = { slug };
        if (excludeId)
            filter._id = { $ne: excludeId };
        const existing = await this.categoryModel.exists(filter);
        if (existing) {
            throw new common_1.ConflictException(`Category slug "${slug}" is already in use`);
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        seo_entries_service_1.SeoEntriesService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map