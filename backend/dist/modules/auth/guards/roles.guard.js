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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_constants_1 = require("../../../common/constants/app.constants");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles?.length) {
            return true;
        }
        const request = context
            .switchToHttp()
            .getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const roleHierarchy = {
            [app_constants_1.UserRole.EDITOR]: 1,
            [app_constants_1.UserRole.ADMIN]: 2,
            [app_constants_1.UserRole.SUPER_ADMIN]: 3,
        };
        const userLevel = roleHierarchy[user.role] ?? 0;
        const requiredLevel = Math.min(...requiredRoles.map((r) => roleHierarchy[r] ?? 0));
        if (userLevel < requiredLevel) {
            throw new common_1.ForbiddenException(`Required role: ${requiredRoles.join(' or ')}`);
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map