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
exports.UsersAdminController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const query_user_dto_1 = require("./dto/query-user.dto");
const update_user_role_dto_1 = require("./dto/update-user-role.dto");
const update_user_status_dto_1 = require("./dto/update-user-status.dto");
let UsersAdminController = class UsersAdminController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    findAll(query) {
        return this.usersService.findAllAdmin(query);
    }
    findOne(id) {
        return this.usersService.findByIdAdmin(id);
    }
    async create(dto) {
        const created = await this.usersService.create(dto);
        return this.usersService.findByIdAdmin(String(created._id));
    }
    updateRole(id, dto, currentUser) {
        return this.usersService.updateRole(id, dto.role, currentUser._id);
    }
    updateStatus(id, dto, currentUser) {
        return this.usersService.updateStatus(id, dto.status, currentUser._id);
    }
    remove(id, currentUser) {
        return this.usersService.remove(id, currentUser._id);
    }
};
exports.UsersAdminController = UsersAdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_user_dto_1.QueryUserDto]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_role_dto_1.UpdateUserRoleDto, Object]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_status_dto_1.UpdateUserStatusDto, Object]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "remove", null);
exports.UsersAdminController = UsersAdminController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersAdminController);
//# sourceMappingURL=users.admin.controller.js.map