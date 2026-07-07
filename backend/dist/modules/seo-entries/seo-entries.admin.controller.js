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
exports.SeoEntriesAdminController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const seo_meta_dto_1 = require("../../common/dto/seo-meta.dto");
const seo_entries_service_1 = require("./seo-entries.service");
const create_seo_entry_dto_1 = require("./dto/create-seo-entry.dto");
const query_seo_entry_dto_1 = require("./dto/query-seo-entry.dto");
let SeoEntriesAdminController = class SeoEntriesAdminController {
    seoEntriesService;
    constructor(seoEntriesService) {
        this.seoEntriesService = seoEntriesService;
    }
    findAll(query) {
        return this.seoEntriesService.findAllAdmin(query);
    }
    findOne(id) {
        return this.seoEntriesService.findByIdAdmin(id);
    }
    create(dto) {
        return this.seoEntriesService.createCustom(dto);
    }
    update(id, dto) {
        return this.seoEntriesService.update(id, dto);
    }
    remove(id) {
        return this.seoEntriesService.remove(id);
    }
};
exports.SeoEntriesAdminController = SeoEntriesAdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_seo_entry_dto_1.QuerySeoEntryDto]),
    __metadata("design:returntype", void 0)
], SeoEntriesAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SeoEntriesAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_seo_entry_dto_1.CreateSeoEntryDto]),
    __metadata("design:returntype", void 0)
], SeoEntriesAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN, app_constants_1.UserRole.EDITOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seo_meta_dto_1.SeoMetaDto]),
    __metadata("design:returntype", void 0)
], SeoEntriesAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SeoEntriesAdminController.prototype, "remove", null);
exports.SeoEntriesAdminController = SeoEntriesAdminController = __decorate([
    (0, common_1.Controller)('admin/seo'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN, app_constants_1.UserRole.EDITOR),
    __metadata("design:paramtypes", [seo_entries_service_1.SeoEntriesService])
], SeoEntriesAdminController);
//# sourceMappingURL=seo-entries.admin.controller.js.map