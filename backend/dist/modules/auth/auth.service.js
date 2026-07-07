"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    jwtConfig;
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.jwtConfig = this.configService.get('jwt');
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.password);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user);
        await this.usersService.updateRefreshToken(String(user._id), tokens.refreshToken);
        await this.usersService.updateLastLogin(String(user._id));
        return {
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
            },
            tokens,
        };
    }
    async refresh(userId, rawRefreshToken) {
        const user = await this.usersService.findByIdWithRefreshToken(userId);
        if (!user?.refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token revoked');
        }
        const isValid = await bcrypt.compare(rawRefreshToken, user.refreshToken);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokens = await this.generateTokens(user);
        await this.usersService.updateRefreshToken(String(user._id), tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.usersService.updateRefreshToken(userId, null);
    }
    async changePassword(userId, dto) {
        const user = await this.usersService.findByEmail((await this.usersService.findByIdOrThrow(userId)).email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashed = await bcrypt.hash(dto.newPassword, 12);
        await this.usersService.updatePassword(userId, hashed);
        await this.usersService.updateRefreshToken(userId, null);
    }
    getMe(user) {
        return user;
    }
    async generateTokens(user) {
        const sub = String(user._id);
        const accessPayload = {
            sub,
            email: user.email,
            role: user.role,
            type: 'access',
        };
        const refreshPayload = {
            sub,
            email: user.email,
            role: user.role,
            type: 'refresh',
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessPayload, {
                secret: this.jwtConfig.secret,
                expiresIn: this.jwtConfig
                    .expiresIn,
            }),
            this.jwtService.signAsync(refreshPayload, {
                secret: this.jwtConfig.refreshSecret,
                expiresIn: this.jwtConfig
                    .refreshExpiresIn,
            }),
        ]);
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map