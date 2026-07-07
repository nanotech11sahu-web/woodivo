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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("./schemas/user.schema");
const app_constants_1 = require("../../common/constants/app.constants");
const paginated_result_interface_1 = require("../../common/interfaces/paginated-result.interface");
const BCRYPT_ROUNDS = 12;
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(dto) {
        const existing = await this.userModel.findOne({
            email: dto.email.toLowerCase(),
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const user = new this.userModel({
            ...dto,
            email: dto.email.toLowerCase(),
            password: hashedPassword,
            role: dto.role ?? app_constants_1.UserRole.EDITOR,
        });
        return user.save();
    }
    async findById(id) {
        return this.userModel.findById(id).exec();
    }
    async findByIdWithRefreshToken(id) {
        return this.userModel.findById(id).select('+refreshToken').exec();
    }
    async findByEmail(email) {
        return this.userModel
            .findOne({ email: email.toLowerCase() })
            .select('+password')
            .exec();
    }
    async findAll() {
        return this.userModel.find().select('-password -refreshToken').exec();
    }
    async updateRefreshToken(id, refreshToken) {
        const hashed = refreshToken
            ? await bcrypt.hash(refreshToken, BCRYPT_ROUNDS)
            : null;
        await this.userModel.findByIdAndUpdate(id, { refreshToken: hashed }).exec();
    }
    async updateLastLogin(id) {
        await this.userModel
            .findByIdAndUpdate(id, { lastLoginAt: new Date() })
            .exec();
    }
    async updatePassword(id, hashedPassword) {
        await this.userModel
            .findByIdAndUpdate(id, { password: hashedPassword })
            .exec();
    }
    async existsByEmail(email) {
        const count = await this.userModel.countDocuments({
            email: email.toLowerCase(),
        });
        return count > 0;
    }
    async ensureSuperAdminExists(name, email, password) {
        const exists = await this.existsByEmail(email);
        if (exists)
            return;
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await this.userModel.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: app_constants_1.UserRole.SUPER_ADMIN,
        });
    }
    async findByIdOrThrow(id) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, search, role, status, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const filter = {};
        if (role)
            filter.role = role;
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const sort = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [items, total] = await Promise.all([
            this.userModel
                .find(filter)
                .select('-password -refreshToken')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.userModel.countDocuments(filter),
        ]);
        return { items, meta: (0, paginated_result_interface_1.buildPaginationMeta)(total, page, limit) };
    }
    async findByIdAdmin(id) {
        const user = await this.userModel
            .findById(id)
            .select('-password -refreshToken')
            .exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateRole(id, role, currentUserId) {
        if (id === currentUserId) {
            throw new common_1.BadRequestException('You cannot change your own role');
        }
        const user = await this.userModel.findById(id).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.role = role;
        await user.save();
        return this.findByIdAdmin(id);
    }
    async updateStatus(id, status, currentUserId) {
        if (id === currentUserId) {
            throw new common_1.BadRequestException('You cannot change your own status');
        }
        const user = await this.userModel.findById(id).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.status = status;
        await user.save();
        return this.findByIdAdmin(id);
    }
    async remove(id, currentUserId) {
        if (id === currentUserId) {
            throw new common_1.BadRequestException('You cannot delete your own account');
        }
        const result = await this.userModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('User not found');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map