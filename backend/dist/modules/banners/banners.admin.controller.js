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
exports.BannersAdminController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const reorder_items_dto_1 = require("../../common/dto/reorder-items.dto");
const banners_service_1 = require("./banners.service");
const create_banner_dto_1 = require("./dto/create-banner.dto");
const update_banner_dto_1 = require("./dto/update-banner.dto");
const query_banner_dto_1 = require("./dto/query-banner.dto");
const banner_schema_1 = require("./schemas/banner.schema");
let BannersAdminController = class BannersAdminController {
    bannersService;
    constructor(bannersService) {
        this.bannersService = bannersService;
    }
    findAll(query) {
        return this.bannersService.findAllAdmin(query);
    }
    findOne(id) {
        return this.bannersService.findByIdAdmin(id);
    }
    create(dto) {
        return this.bannersService.create(dto);
    }
    reorder(dto) {
        return this.bannersService.reorder(dto);
    }
    setStatus(id, status) {
        return this.bannersService.setStatus(id, status);
    }
    update(id, dto) {
        return this.bannersService.update(id, dto);
    }
    remove(id) {
        return this.bannersService.remove(id);
    }
};
exports.BannersAdminController = BannersAdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_banner_dto_1.QueryBannerDto]),
    __metadata("design:returntype", void 0)
], BannersAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BannersAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_banner_dto_1.CreateBannerDto]),
    __metadata("design:returntype", void 0)
], BannersAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_items_dto_1.ReorderItemsDto]),
    __metadata("design:returntype", void 0)
], BannersAdminController.prototype, "reorder", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BannersAdminController.prototype, "setStatus", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_banner_dto_1.UpdateBannerDto]),
    __metadata("design:returntype", void 0)
], BannersAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BannersAdminController.prototype, "remove", null);
exports.BannersAdminController = BannersAdminController = __decorate([
    (0, common_1.Controller)('admin/banners'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN, app_constants_1.UserRole.EDITOR),
    __metadata("design:paramtypes", [banners_service_1.BannersService])
], BannersAdminController);
//# sourceMappingURL=banners.admin.controller.js.map