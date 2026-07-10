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
exports.SeoEntriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const seo_entry_schema_1 = require("./schemas/seo-entry.schema");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
const STATIC_PAGES = [
    { path: '/', pageType: seo_entry_schema_1.SeoPageType.HOME, entityLabel: 'Home' },
    { path: '/about', pageType: seo_entry_schema_1.SeoPageType.ABOUT, entityLabel: 'About' },
    { path: '/contact', pageType: seo_entry_schema_1.SeoPageType.CONTACT, entityLabel: 'Contact' },
    { path: '/gallery', pageType: seo_entry_schema_1.SeoPageType.GALLERY, entityLabel: 'Gallery' },
    {
        path: '/projects',
        pageType: seo_entry_schema_1.SeoPageType.PROJECTS_LISTING,
        entityLabel: 'Projects',
    },
    { path: '/blogs', pageType: seo_entry_schema_1.SeoPageType.BLOGS_LISTING, entityLabel: 'Blogs' },
];
let SeoEntriesService = class SeoEntriesService {
    seoEntryModel;
    constructor(seoEntryModel) {
        this.seoEntryModel = seoEntryModel;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, search, pageType } = query;
        const filter = {};
        if (pageType)
            filter.pageType = pageType;
        if (search) {
            filter.$or = [
                { path: { $regex: search, $options: 'i' } },
                { entityLabel: { $regex: search, $options: 'i' } },
                { metaTitle: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.seoEntryModel
                .find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.seoEntryModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findByIdAdmin(id) {
        const entry = await this.seoEntryModel.findById(id).exec();
        if (!entry)
            throw new common_1.NotFoundException('SEO entry not found');
        return entry;
    }
    async findByPath(path) {
        return this.seoEntryModel
            .findOne({ path: this.normalizePath(path) })
            .exec();
    }
    async update(id, dto) {
        const entry = await this.findByIdAdmin(id);
        Object.assign(entry, dto);
        return entry.save();
    }
    async createCustom(dto) {
        const path = this.normalizePath(dto.path);
        const existing = await this.seoEntryModel.exists({ path });
        if (existing) {
            throw new common_1.ConflictException(`An SEO entry for "${path}" already exists`);
        }
        const entry = new this.seoEntryModel({
            ...dto,
            path,
            pageType: seo_entry_schema_1.SeoPageType.CUSTOM,
        });
        return entry.save();
    }
    async remove(id) {
        const entry = await this.findByIdAdmin(id);
        if (entry.pageType !== seo_entry_schema_1.SeoPageType.CUSTOM) {
            throw new common_1.ConflictException("Only custom SEO entries can be deleted directly — entries generated from a product, blog, category or project follow that content's own lifecycle and disappear when it does.");
        }
        await this.seoEntryModel.deleteOne({ _id: entry._id });
    }
    async syncForEntity(params) {
        const { pageType, entityId, entityLabel, path } = params;
        const normalized = this.normalizePath(path);
        const existing = await this.seoEntryModel
            .findOne({ entityId, pageType })
            .exec();
        if (existing) {
            if (existing.path !== normalized ||
                existing.entityLabel !== entityLabel) {
                await this.seoEntryModel.deleteOne({
                    path: normalized,
                    _id: { $ne: existing._id },
                });
                existing.path = normalized;
                existing.entityLabel = entityLabel;
                await existing.save();
            }
            return;
        }
        await this.seoEntryModel.deleteOne({ path: normalized });
        await this.seoEntryModel.create({
            path: normalized,
            pageType,
            entityId,
            entityLabel,
        });
    }
    async removeForEntity(pageType, entityId) {
        await this.seoEntryModel.deleteOne({ pageType, entityId });
    }
    async ensureStaticPages() {
        await Promise.all(STATIC_PAGES.map(({ path, pageType, entityLabel }) => this.seoEntryModel.updateOne({ path }, { $setOnInsert: { path, pageType, entityLabel } }, { upsert: true })));
    }
    normalizePath(path) {
        const trimmed = path.trim();
        if (trimmed === '' || trimmed === '/')
            return '/';
        const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return withLeadingSlash.replace(/\/+$/, '');
    }
};
exports.SeoEntriesService = SeoEntriesService;
exports.SeoEntriesService = SeoEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(seo_entry_schema_1.SeoEntry.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SeoEntriesService);
//# sourceMappingURL=seo-entries.service.js.map