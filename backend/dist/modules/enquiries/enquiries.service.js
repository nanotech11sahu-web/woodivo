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
exports.EnquiriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enquiry_schema_1 = require("./schemas/enquiry.schema");
const category_schema_1 = require("../categories/schemas/category.schema");
const mail_service_1 = require("../mail/mail.service");
const slugify_1 = require("../../common/utils/slugify");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
let EnquiriesService = class EnquiriesService {
    enquiryModel;
    categoryModel;
    mailService;
    constructor(enquiryModel, categoryModel, mailService) {
        this.enquiryModel = enquiryModel;
        this.categoryModel = categoryModel;
        this.mailService = mailService;
    }
    async create(dto) {
        let categoryDoc = null;
        if (dto.interestedCategory) {
            categoryDoc = await this.categoryModel
                .findOne({
                slug: (0, slugify_1.slugify)(dto.interestedCategory),
                status: category_schema_1.CategoryStatus.ACTIVE,
            })
                .exec();
        }
        const enquiry = await new this.enquiryModel({
            fullName: dto.fullName,
            mobileNumber: dto.mobileNumber,
            city: dto.city,
            message: dto.message,
            source: dto.source,
            interestedCategory: categoryDoc?._id,
        }).save();
        void this.mailService.sendEnquiryNotification({
            fullName: enquiry.fullName,
            mobileNumber: enquiry.mobileNumber,
            city: enquiry.city,
            categoryName: categoryDoc?.name,
            message: enquiry.message,
            source: enquiry.source,
            submittedAt: enquiry.createdAt ?? new Date(),
        });
        return enquiry;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, search, status, source, category, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (source)
            filter.source = source;
        if (category)
            filter.interestedCategory = category;
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { mobileNumber: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.enquiryModel
                .find(filter)
                .populate('interestedCategory', 'name slug')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.enquiryModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findByIdAdmin(id) {
        const enquiry = await this.enquiryModel
            .findById(id)
            .populate('interestedCategory', 'name slug')
            .exec();
        if (!enquiry)
            throw new common_1.NotFoundException('Enquiry not found');
        return enquiry;
    }
    async update(id, dto) {
        const enquiry = await this.enquiryModel.findById(id).exec();
        if (!enquiry)
            throw new common_1.NotFoundException('Enquiry not found');
        Object.assign(enquiry, dto);
        return enquiry.save();
    }
    async remove(id) {
        const result = await this.enquiryModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Enquiry not found');
        }
    }
    async getStats() {
        const counts = await this.enquiryModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
        const byStatus = Object.values(enquiry_schema_1.EnquiryStatus).reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
        let total = 0;
        for (const { _id, count } of counts) {
            byStatus[_id] = count;
            total += count;
        }
        return { total, byStatus };
    }
};
exports.EnquiriesService = EnquiriesService;
exports.EnquiriesService = EnquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(enquiry_schema_1.Enquiry.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService])
], EnquiriesService);
//# sourceMappingURL=enquiries.service.js.map