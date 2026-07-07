import { Model } from 'mongoose';
import { UserDocument, UserStatus } from './schemas/user.schema';
import { UserRole } from "../../common/constants/app.constants";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import type { CreateUserDto } from './dto/create-user.dto';
import type { QueryUserDto } from './dto/query-user.dto';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    create(dto: CreateUserDto): Promise<UserDocument>;
    findById(id: string): Promise<UserDocument | null>;
    findByIdWithRefreshToken(id: string): Promise<UserDocument | null>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findAll(): Promise<UserDocument[]>;
    updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
    updateLastLogin(id: string): Promise<void>;
    updatePassword(id: string, hashedPassword: string): Promise<void>;
    existsByEmail(email: string): Promise<boolean>;
    ensureSuperAdminExists(name: string, email: string, password: string): Promise<void>;
    findByIdOrThrow(id: string): Promise<UserDocument>;
    findAllAdmin(query: QueryUserDto): Promise<PaginatedResult<UserDocument>>;
    findByIdAdmin(id: string): Promise<UserDocument>;
    updateRole(id: string, role: UserRole, currentUserId: string): Promise<UserDocument>;
    updateStatus(id: string, status: UserStatus, currentUserId: string): Promise<UserDocument>;
    remove(id: string, currentUserId: string): Promise<void>;
}
