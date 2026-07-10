"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const health_controller_1 = require("./health.controller");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
const category_schema_1 = require("../categories/schemas/category.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const blog_schema_1 = require("../blogs/schemas/blog.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
const gallery_item_schema_1 = require("../gallery/schemas/gallery-item.schema");
const testimonial_schema_1 = require("../testimonials/schemas/testimonial.schema");
const faq_schema_1 = require("../faqs/schemas/faq.schema");
const enquiries_module_1 = require("../enquiries/enquiries.module");
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: blog_schema_1.Blog.name, schema: blog_schema_1.BlogSchema },
                { name: project_schema_1.Project.name, schema: project_schema_1.ProjectSchema },
                { name: gallery_item_schema_1.GalleryItem.name, schema: gallery_item_schema_1.GalleryItemSchema },
                { name: testimonial_schema_1.Testimonial.name, schema: testimonial_schema_1.TestimonialSchema },
                { name: faq_schema_1.Faq.name, schema: faq_schema_1.FaqSchema },
            ]),
            enquiries_module_1.EnquiriesModule,
        ],
        controllers: [health_controller_1.HealthController, dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
    })
], HealthModule);
//# sourceMappingURL=health.module.js.map