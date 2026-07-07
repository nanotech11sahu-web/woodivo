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
exports.TestimonialsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const testimonial_schema_1 = require("./schemas/testimonial.schema");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
let TestimonialsService = class TestimonialsService {
    testimonialModel;
    constructor(testimonialModel) {
        this.testimonialModel = testimonialModel;
    }
    async create(dto) {
        return new this.testimonialModel(dto).save();
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, status, isFeatured, sortBy = 'displayOrder', sortOrder = 'asc', } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (typeof isFeatured === 'boolean')
            filter.isFeatured = isFeatured;
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.testimonialModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.testimonialModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findAllPublic(query) {
        const { page = 1, limit = 20, featuredOnly } = query;
        const filter = {
            status: testimonial_schema_1.TestimonialStatus.ACTIVE,
        };
        if (featuredOnly)
            filter.isFeatured = true;
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.testimonialModel
                .find(filter)
                .sort({ displayOrder: 1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.testimonialModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findByIdAdmin(id) {
        const testimonial = await this.testimonialModel.findById(id).exec();
        if (!testimonial)
            throw new common_1.NotFoundException('Testimonial not found');
        return testimonial;
    }
    async update(id, dto) {
        const testimonial = await this.findByIdAdmin(id);
        Object.assign(testimonial, dto);
        return testimonial.save();
    }
    async remove(id) {
        const result = await this.testimonialModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Testimonial not found');
        }
    }
    async reorder(dto) {
        const operations = dto.items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { $set: { displayOrder: item.displayOrder } },
            },
        }));
        await this.testimonialModel.bulkWrite(operations);
    }
    async setStatus(id, status) {
        const testimonial = await this.findByIdAdmin(id);
        testimonial.status = status;
        return testimonial.save();
    }
};
exports.TestimonialsService = TestimonialsService;
exports.TestimonialsService = TestimonialsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(testimonial_schema_1.Testimonial.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TestimonialsService);
//# sourceMappingURL=testimonials.service.js.map