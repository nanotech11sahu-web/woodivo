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
exports.BlogCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const blog_schema_1 = require("./schemas/blog.schema");
const slugify_1 = require("../../common/utils/slugify");
let BlogCategoriesService = class BlogCategoriesService {
    blogCategoryModel;
    blogModel;
    constructor(blogCategoryModel, blogModel) {
        this.blogCategoryModel = blogCategoryModel;
        this.blogModel = blogModel;
    }
    async create(dto) {
        const slug = (0, slugify_1.slugify)(dto.slug || dto.name);
        await this.ensureSlugAvailable(slug);
        const category = new this.blogCategoryModel({ ...dto, slug });
        return category.save();
    }
    async findAll() {
        return this.blogCategoryModel.find().sort({ displayOrder: 1 }).exec();
    }
    async findByIdAdmin(id) {
        const category = await this.blogCategoryModel.findById(id).exec();
        if (!category)
            throw new common_1.NotFoundException('Blog category not found');
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
        Object.assign(category, { ...dto, slug: category.slug });
        return category.save();
    }
    async remove(id) {
        const category = await this.findByIdAdmin(id);
        const blogCount = await this.blogModel.countDocuments({
            category: category._id.toString(),
        });
        if (blogCount > 0) {
            throw new common_1.ConflictException(`Cannot delete blog category: ${blogCount} blog(s) still reference it. Reassign or remove them first.`);
        }
        await this.blogCategoryModel.deleteOne({ _id: category._id });
    }
    async reorder(dto) {
        const operations = dto.items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { $set: { displayOrder: item.displayOrder } },
            },
        }));
        await this.blogCategoryModel.bulkWrite(operations);
    }
    async ensureSlugAvailable(slug, excludeId) {
        const filter = { slug };
        if (excludeId)
            filter._id = { $ne: excludeId };
        const existing = await this.blogCategoryModel.exists(filter);
        if (existing) {
            throw new common_1.ConflictException(`Blog category slug "${slug}" is already in use`);
        }
    }
};
exports.BlogCategoriesService = BlogCategoriesService;
exports.BlogCategoriesService = BlogCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(blog_schema_1.BlogCategory.name)),
    __param(1, (0, mongoose_1.InjectModel)(blog_schema_1.Blog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], BlogCategoriesService);
//# sourceMappingURL=blog-categories.service.js.map