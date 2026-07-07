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
exports.AboutAdminController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const about_service_1 = require("./about.service");
const update_about_page_dto_1 = require("./dto/update-about-page.dto");
let AboutAdminController = class AboutAdminController {
    aboutService;
    constructor(aboutService) {
        this.aboutService = aboutService;
    }
    get() {
        return this.aboutService.get();
    }
    update(dto) {
        return this.aboutService.update(dto);
    }
};
exports.AboutAdminController = AboutAdminController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AboutAdminController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_about_page_dto_1.UpdateAboutPageDto]),
    __metadata("design:returntype", void 0)
], AboutAdminController.prototype, "update", null);
exports.AboutAdminController = AboutAdminController = __decorate([
    (0, common_1.Controller)('admin/about'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [about_service_1.AboutService])
], AboutAdminController);
//# sourceMappingURL=about.admin.controller.js.map