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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const project_schema_1 = require("./schemas/project.schema");
const category_schema_1 = require("../categories/schemas/category.schema");
const slugify_1 = require("../../common/utils/slugify");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
const seo_entries_service_1 = require("../seo-entries/seo-entries.service");
const seo_entry_schema_1 = require("../seo-entries/schemas/seo-entry.schema");
const CATEGORY_POPULATE_FIELDS = 'name slug thumbnail status';
let ProjectsService = class ProjectsService {
    projectModel;
    categoryModel;
    seoEntriesService;
    constructor(projectModel, categoryModel, seoEntriesService) {
        this.projectModel = projectModel;
        this.categoryModel = categoryModel;
        this.seoEntriesService = seoEntriesService;
    }
    async create(dto) {
        const categoryId = dto.category
            ? (await this.getCategoryOrThrow(dto.category))._id
            : undefined;
        const slug = (0, slugify_1.slugify)(dto.slug || dto.title);
        await this.ensureSlugAvailable(slug);
        const project = new this.projectModel({
            ...dto,
            category: categoryId,
            slug,
        });
        const saved = await project.save();
        await this.syncSeoEntry(saved);
        return saved;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, search, status, category, isFeatured, sortBy = 'displayOrder', sortOrder = 'asc', } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (category)
            filter.category = new mongoose_2.Types.ObjectId(category);
        if (typeof isFeatured === 'boolean')
            filter.isFeatured = isFeatured;
        if (search)
            filter.$text = { $search: search };
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.projectModel
                .find(filter)
                .populate('category', CATEGORY_POPULATE_FIELDS)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.projectModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findAllPublic(query) {
        const { page = 1, limit = 20, search, category, featured } = query;
        const filter = {
            status: project_schema_1.ProjectStatus.ACTIVE,
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
        const [items, total] = await Promise.all([
            this.projectModel
                .find(filter)
                .populate('category', CATEGORY_POPULATE_FIELDS)
                .sort({ displayOrder: 1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.projectModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findByIdAdmin(id) {
        const project = await this.projectModel
            .findById(id)
            .populate('category', CATEGORY_POPULATE_FIELDS)
            .exec();
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
    async findBySlugPublic(slug) {
        const project = await this.projectModel
            .findOne({ slug: (0, slugify_1.slugify)(slug), status: project_schema_1.ProjectStatus.ACTIVE })
            .populate('category', CATEGORY_POPULATE_FIELDS)
            .exec();
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
    async update(id, dto) {
        const project = await this.projectModel.findById(id).exec();
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (dto.category) {
            const category = await this.getCategoryOrThrow(dto.category);
            project.category = category._id;
        }
        if (dto.slug || dto.title) {
            const nextSlug = (0, slugify_1.slugify)(dto.slug || dto.title || project.slug);
            if (nextSlug !== project.slug) {
                await this.ensureSlugAvailable(nextSlug, id);
                project.slug = nextSlug;
            }
        }
        Object.assign(project, {
            ...dto,
            category: project.category,
            slug: project.slug,
        });
        const saved = await project.save();
        await this.syncSeoEntry(saved);
        return saved;
    }
    async remove(id) {
        const result = await this.projectModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Project not found');
        }
        await this.seoEntriesService.removeForEntity(seo_entry_schema_1.SeoPageType.PROJECT, id);
    }
    async syncSeoEntry(project) {
        await this.seoEntriesService.syncForEntity({
            pageType: seo_entry_schema_1.SeoPageType.PROJECT,
            entityId: project._id,
            entityLabel: project.title,
            path: `/projects/${project.slug}`,
        });
    }
    async reorder(dto) {
        const operations = dto.items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { $set: { displayOrder: item.displayOrder } },
            },
        }));
        await this.projectModel.bulkWrite(operations);
    }
    async setStatus(id, status) {
        const project = await this.projectModel.findById(id).exec();
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        project.status = status;
        return project.save();
    }
    async getCategoryOrThrow(categoryId) {
        const category = await this.categoryModel.findById(categoryId).exec();
        if (!category) {
            throw new common_1.BadRequestException(`Category "${categoryId}" does not exist`);
        }
        return category;
    }
    async ensureSlugAvailable(slug, excludeId) {
        const filter = { slug };
        if (excludeId)
            filter._id = { $ne: excludeId };
        const existing = await this.projectModel.exists(filter);
        if (existing) {
            throw new common_1.ConflictException(`Project slug "${slug}" is already in use`);
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        seo_entries_service_1.SeoEntriesService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map