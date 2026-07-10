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
exports.FaqsAdminController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const reorder_items_dto_1 = require("../../common/dto/reorder-items.dto");
const faqs_service_1 = require("./faqs.service");
const create_faq_dto_1 = require("./dto/create-faq.dto");
const update_faq_dto_1 = require("./dto/update-faq.dto");
const query_faq_dto_1 = require("./dto/query-faq.dto");
const faq_schema_1 = require("./schemas/faq.schema");
let FaqsAdminController = class FaqsAdminController {
    faqsService;
    constructor(faqsService) {
        this.faqsService = faqsService;
    }
    findAll(query) {
        return this.faqsService.findAllAdmin(query);
    }
    findOne(id) {
        return this.faqsService.findByIdAdmin(id);
    }
    create(dto) {
        return this.faqsService.create(dto);
    }
    reorder(dto) {
        return this.faqsService.reorder(dto);
    }
    setStatus(id, status) {
        return this.faqsService.setStatus(id, status);
    }
    update(id, dto) {
        return this.faqsService.update(id, dto);
    }
    remove(id) {
        return this.faqsService.remove(id);
    }
};
exports.FaqsAdminController = FaqsAdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_faq_dto_1.QueryFaqDto]),
    __metadata("design:returntype", void 0)
], FaqsAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FaqsAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_faq_dto_1.CreateFaqDto]),
    __metadata("design:returntype", void 0)
], FaqsAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_items_dto_1.ReorderItemsDto]),
    __metadata("design:returntype", void 0)
], FaqsAdminController.prototype, "reorder", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FaqsAdminController.prototype, "setStatus", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_faq_dto_1.UpdateFaqDto]),
    __metadata("design:returntype", void 0)
], FaqsAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FaqsAdminController.prototype, "remove", null);
exports.FaqsAdminController = FaqsAdminController = __decorate([
    (0, common_1.Controller)('admin/faqs'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN, app_constants_1.UserRole.EDITOR),
    __metadata("design:paramtypes", [faqs_service_1.FaqsService])
], FaqsAdminController);
//# sourceMappingURL=faqs.admin.controller.js.map