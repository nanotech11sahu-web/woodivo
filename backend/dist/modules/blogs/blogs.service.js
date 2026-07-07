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
exports.BlogsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const blog_schema_1 = require("./schemas/blog.schema");
const slugify_1 = require("../../common/utils/slugify");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
const seo_entries_service_1 = require("../seo-entries/seo-entries.service");
const seo_entry_schema_1 = require("../seo-entries/schemas/seo-entry.schema");
const CATEGORY_POPULATE_FIELDS = 'name slug';
let BlogsService = class BlogsService {
    blogModel;
    blogCategoryModel;
    seoEntriesService;
    constructor(blogModel, blogCategoryModel, seoEntriesService) {
        this.blogModel = blogModel;
        this.blogCategoryModel = blogCategoryModel;
        this.seoEntriesService = seoEntriesService;
    }
    async create(dto) {
        const categoryId = dto.category
            ? (await this.getCategoryOrThrow(dto.category))._id.toString()
            : undefined;
        const slug = (0, slugify_1.slugify)(dto.slug || dto.title);
        await this.ensureSlugAvailable(slug);
        const blog = new this.blogModel({
            ...dto,
            category: categoryId,
            slug,
        });
        const saved = await blog.save();
        await this.syncSeoEntry(saved);
        return saved;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, search, status, category, isFeatured, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (category)
            filter.category = category;
        if (typeof isFeatured === 'boolean')
            filter.isFeatured = isFeatured;
        if (search)
            filter.$text = { $search: search };
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.blogModel
                .find(filter)
                .populate('category', CATEGORY_POPULATE_FIELDS)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.blogModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findAllPublic(query) {
        const { page = 1, limit = 20, search, category, tag } = query;
        const filter = this.publishedFilter();
        if (tag)
            filter.tags = tag;
        if (search)
            filter.$text = { $search: search };
        if (category) {
            const categoryDoc = await this.blogCategoryModel
                .findOne({ slug: (0, slugify_1.slugify)(category) })
                .exec();
            if (!categoryDoc) {
                return { items: [], meta: (0, paginated_result_interface_1.buildPaginationMeta)(0, page, limit) };
            }
            filter.category = categoryDoc._id.toString();
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.blogModel
                .find(filter)
                .populate('category', CATEGORY_POPULATE_FIELDS)
                .sort({ publishAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.blogModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findLatestPublic(limit = 5) {
        return this.blogModel
            .find(this.publishedFilter())
            .populate('category', CATEGORY_POPULATE_FIELDS)
            .sort({ publishAt: -1, createdAt: -1 })
            .limit(limit)
            .exec();
    }
    async findByIdAdmin(id) {
        const blog = await this.blogModel
            .findById(id)
            .populate('category', CATEGORY_POPULATE_FIELDS)
            .exec();
        if (!blog)
            throw new common_1.NotFoundException('Blog not found');
        return blog;
    }
    async findBySlugPublic(slug) {
        const blog = await this.blogModel
            .findOne({ slug: (0, slugify_1.slugify)(slug), ...this.publishedFilter() })
            .populate('category', CATEGORY_POPULATE_FIELDS)
            .exec();
        if (!blog)
            throw new common_1.NotFoundException('Blog not found');
        void this.blogModel
            .updateOne({ _id: blog._id }, { $inc: { viewCount: 1 } })
            .exec()
            .catch(() => undefined);
        return blog;
    }
    async update(id, dto) {
        const blog = await this.blogModel.findById(id).exec();
        if (!blog)
            throw new common_1.NotFoundException('Blog not found');
        if (dto.category) {
            const category = await this.getCategoryOrThrow(dto.category);
            blog.category = category._id.toString();
        }
        if (dto.slug || dto.title) {
            const nextSlug = (0, slugify_1.slugify)(dto.slug || dto.title || blog.slug);
            if (nextSlug !== blog.slug) {
                await this.ensureSlugAvailable(nextSlug, id);
                blog.slug = nextSlug;
            }
        }
        Object.assign(blog, {
            ...dto,
            category: blog.category,
            slug: blog.slug,
        });
        const saved = await blog.save();
        await this.syncSeoEntry(saved);
        return saved;
    }
    async remove(id) {
        const result = await this.blogModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Blog not found');
        }
        await this.seoEntriesService.removeForEntity(seo_entry_schema_1.SeoPageType.BLOG, id);
    }
    async syncSeoEntry(blog) {
        await this.seoEntriesService.syncForEntity({
            pageType: seo_entry_schema_1.SeoPageType.BLOG,
            entityId: blog._id,
            entityLabel: blog.title,
            path: `/blogs/${blog.slug}`,
        });
    }
    publishedFilter() {
        const now = new Date();
        return {
            $or: [
                { status: blog_schema_1.BlogStatus.PUBLISHED },
                { status: blog_schema_1.BlogStatus.SCHEDULED, publishAt: { $lte: now } },
            ],
        };
    }
    async getCategoryOrThrow(categoryId) {
        const category = await this.blogCategoryModel.findById(categoryId).exec();
        if (!category) {
            throw new common_1.BadRequestException(`Blog category "${categoryId}" does not exist`);
        }
        return category;
    }
    async ensureSlugAvailable(slug, excludeId) {
        const filter = { slug };
        if (excludeId)
            filter._id = { $ne: excludeId };
        const existing = await this.blogModel.exists(filter);
        if (existing) {
            throw new common_1.ConflictException(`Blog slug "${slug}" is already in use`);
        }
    }
};
exports.BlogsService = BlogsService;
exports.BlogsService = BlogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(blog_schema_1.Blog.name)),
    __param(1, (0, mongoose_1.InjectModel)(blog_schema_1.BlogCategory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        seo_entries_service_1.SeoEntriesService])
], BlogsService);
//# sourceMappingURL=blogs.service.js.map