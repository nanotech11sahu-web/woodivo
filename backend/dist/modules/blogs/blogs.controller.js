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
exports.BlogsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const blogs_service_1 = require("./blogs.service");
const blog_categories_service_1 = require("./blog-categories.service");
const query_public_blog_dto_1 = require("./dto/query-public-blog.dto");
let BlogsController = class BlogsController {
    blogsService;
    blogCategoriesService;
    constructor(blogsService, blogCategoriesService) {
        this.blogsService = blogsService;
        this.blogCategoriesService = blogCategoriesService;
    }
    findAll(query) {
        return this.blogsService.findAllPublic(query);
    }
    findLatest(limit) {
        return this.blogsService.findLatestPublic(limit ? Number(limit) : undefined);
    }
    findCategories() {
        return this.blogCategoriesService.findAll();
    }
    findOne(slug) {
        return this.blogsService.findBySlugPublic(slug);
    }
};
exports.BlogsController = BlogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_public_blog_dto_1.QueryPublicBlogDto]),
    __metadata("design:returntype", void 0)
], BlogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('latest'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BlogsController.prototype, "findLatest", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlogsController.prototype, "findCategories", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BlogsController.prototype, "findOne", null);
exports.BlogsController = BlogsController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('blogs'),
    __metadata("design:paramtypes", [blogs_service_1.BlogsService,
        blog_categories_service_1.BlogCategoriesService])
], BlogsController);
//# sourceMappingURL=blogs.controller.js.map