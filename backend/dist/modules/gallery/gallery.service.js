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
exports.GalleryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const gallery_item_schema_1 = require("./schemas/gallery-item.schema");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
let GalleryService = class GalleryService {
    galleryItemModel;
    constructor(galleryItemModel) {
        this.galleryItemModel = galleryItemModel;
    }
    async create(dto) {
        return new this.galleryItemModel(dto).save();
    }
    async createMany(dto) {
        const docs = dto.items.map((item) => new this.galleryItemModel(item));
        await this.galleryItemModel.bulkSave(docs);
        return docs;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, status, type, tag, sortBy = 'displayOrder', sortOrder = 'asc', } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (type)
            filter.type = type;
        if (tag)
            filter.tags = tag;
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.galleryItemModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.galleryItemModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findAllPublic(query) {
        const { page = 1, limit = 40, type, tag } = query;
        const filter = {
            status: gallery_item_schema_1.GalleryItemStatus.ACTIVE,
        };
        if (type)
            filter.type = type;
        if (tag)
            filter.tags = tag;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.galleryItemModel
                .find(filter)
                .sort({ displayOrder: 1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.galleryItemModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findByIdAdmin(id) {
        const item = await this.galleryItemModel.findById(id).exec();
        if (!item)
            throw new common_1.NotFoundException('Gallery item not found');
        return item;
    }
    async update(id, dto) {
        const item = await this.findByIdAdmin(id);
        Object.assign(item, dto);
        return item.save();
    }
    async remove(id) {
        const result = await this.galleryItemModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Gallery item not found');
        }
    }
    async reorder(dto) {
        const operations = dto.items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { $set: { displayOrder: item.displayOrder } },
            },
        }));
        await this.galleryItemModel.bulkWrite(operations);
    }
    async setStatus(id, status) {
        const item = await this.findByIdAdmin(id);
        item.status = status;
        return item.save();
    }
};
exports.GalleryService = GalleryService;
exports.GalleryService = GalleryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(gallery_item_schema_1.GalleryItem.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GalleryService);
//# sourceMappingURL=gallery.service.js.map