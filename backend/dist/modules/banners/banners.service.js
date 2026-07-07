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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const banner_schema_1 = require("./schemas/banner.schema");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
let BannersService = class BannersService {
    bannerModel;
    constructor(bannerModel) {
        this.bannerModel = bannerModel;
    }
    async create(dto) {
        return new this.bannerModel(dto).save();
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, status, placement, sortBy = 'displayOrder', sortOrder = 'asc', } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (placement)
            filter.placement = placement;
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.bannerModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.bannerModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findAllPublicByPlacement(placement) {
        return this.bannerModel
            .find({ placement, status: banner_schema_1.BannerStatus.ACTIVE })
            .sort({ displayOrder: 1 })
            .exec();
    }
    async findByIdAdmin(id) {
        const banner = await this.bannerModel.findById(id).exec();
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        return banner;
    }
    async update(id, dto) {
        const banner = await this.findByIdAdmin(id);
        Object.assign(banner, dto);
        return banner.save();
    }
    async remove(id) {
        const result = await this.bannerModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Banner not found');
        }
    }
    async reorder(dto) {
        const operations = dto.items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { $set: { displayOrder: item.displayOrder } },
            },
        }));
        await this.bannerModel.bulkWrite(operations);
    }
    async setStatus(id, status) {
        const banner = await this.findByIdAdmin(id);
        banner.status = status;
        return banner.save();
    }
};
exports.BannersService = BannersService;
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(banner_schema_1.Banner.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BannersService);
//# sourceMappingURL=banners.service.js.map