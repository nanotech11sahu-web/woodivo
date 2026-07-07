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
exports.BlogCategoriesAdminController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const reorder_items_dto_1 = require("../../common/dto/reorder-items.dto");
const blog_categories_service_1 = require("./blog-categories.service");
const create_blog_category_dto_1 = require("./dto/create-blog-category.dto");
const update_blog_category_dto_1 = require("./dto/update-blog-category.dto");
let BlogCategoriesAdminController = class BlogCategoriesAdminController {
    blogCategoriesService;
    constructor(blogCategoriesService) {
        this.blogCategoriesService = blogCategoriesService;
    }
    findAll() {
        return this.blogCategoriesService.findAll();
    }
    findOne(id) {
        return this.blogCategoriesService.findByIdAdmin(id);
    }
    create(dto) {
        return this.blogCategoriesService.create(dto);
    }
    reorder(dto) {
        return this.blogCategoriesService.reorder(dto);
    }
    update(id, dto) {
        return this.blogCategoriesService.update(id, dto);
    }
    remove(id) {
        return this.blogCategoriesService.remove(id);
    }
};
exports.BlogCategoriesAdminController = BlogCategoriesAdminController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlogCategoriesAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BlogCategoriesAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_blog_category_dto_1.CreateBlogCategoryDto]),
    __metadata("design:returntype", void 0)
], BlogCategoriesAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_items_dto_1.ReorderItemsDto]),
    __metadata("design:returntype", void 0)
], BlogCategoriesAdminController.prototype, "reorder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_blog_category_dto_1.UpdateBlogCategoryDto]),
    __metadata("design:returntype", void 0)
], BlogCategoriesAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BlogCategoriesAdminController.prototype, "remove", null);
exports.BlogCategoriesAdminController = BlogCategoriesAdminController = __decorate([
    (0, common_1.Controller)('admin/blog-categories'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN, app_constants_1.UserRole.EDITOR),
    __metadata("design:paramtypes", [blog_categories_service_1.BlogCategoriesService])
], BlogCategoriesAdminController);
//# sourceMappingURL=blog-categories.admin.controller.js.map