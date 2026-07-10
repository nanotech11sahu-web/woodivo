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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const category_schema_1 = require("../categories/schemas/category.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const blog_schema_1 = require("../blogs/schemas/blog.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
const gallery_item_schema_1 = require("../gallery/schemas/gallery-item.schema");
const testimonial_schema_1 = require("../testimonials/schemas/testimonial.schema");
const faq_schema_1 = require("../faqs/schemas/faq.schema");
const enquiries_service_1 = require("../enquiries/enquiries.service");
let DashboardService = class DashboardService {
    categoryModel;
    productModel;
    blogModel;
    projectModel;
    galleryItemModel;
    testimonialModel;
    faqModel;
    enquiriesService;
    constructor(categoryModel, productModel, blogModel, projectModel, galleryItemModel, testimonialModel, faqModel, enquiriesService) {
        this.categoryModel = categoryModel;
        this.productModel = productModel;
        this.blogModel = blogModel;
        this.projectModel = projectModel;
        this.galleryItemModel = galleryItemModel;
        this.testimonialModel = testimonialModel;
        this.faqModel = faqModel;
        this.enquiriesService = enquiriesService;
    }
    async getStats() {
        const [categoriesTotal, productStatusCounts, enquiries, blogStatusCounts, projectsTotal, galleryTotal, testimonialsTotal, faqsTotal,] = await Promise.all([
            this.categoryModel.countDocuments(),
            this.productModel.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            this.enquiriesService.getStats(),
            this.blogModel.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            this.projectModel.countDocuments(),
            this.galleryItemModel.countDocuments(),
            this.testimonialModel.countDocuments(),
            this.faqModel.countDocuments(),
        ]);
        const products = this.toStatusSummary(product_schema_1.ProductStatus, productStatusCounts);
        const blogs = this.toStatusSummary(blog_schema_1.BlogStatus, blogStatusCounts);
        return {
            categories: { total: categoriesTotal },
            products,
            enquiries,
            blogs,
            projects: { total: projectsTotal },
            gallery: { total: galleryTotal },
            testimonials: { total: testimonialsTotal },
            faqs: { total: faqsTotal },
        };
    }
    toStatusSummary(statusEnum, counts) {
        const byStatus = Object.values(statusEnum).reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
        let total = 0;
        for (const { _id, count } of counts) {
            byStatus[_id] = count;
            total += count;
        }
        return { total, byStatus };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(blog_schema_1.Blog.name)),
    __param(3, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(4, (0, mongoose_1.InjectModel)(gallery_item_schema_1.GalleryItem.name)),
    __param(5, (0, mongoose_1.InjectModel)(testimonial_schema_1.Testimonial.name)),
    __param(6, (0, mongoose_1.InjectModel)(faq_schema_1.Faq.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        enquiries_service_1.EnquiriesService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map