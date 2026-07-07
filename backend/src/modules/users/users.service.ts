import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserStatus } from './schemas/user.schema';
import { UserRole } from '@common/constants/app.constants';
import {
  buildPaginationMeta,
  PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import type { CreateUserDto } from './dto/create-user.dto';
import type { QueryUserDto } from './dto/query-user.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = new this.userModel({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      role: dto.role ?? UserRole.EDITOR,
    });

    return user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdWithRefreshToken(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+refreshToken').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password -refreshToken').exec();
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashed = refreshToken
      ? await bcrypt.hash(refreshToken, BCRYPT_ROUNDS)
      : null;

    await this.userModel.findByIdAndUpdate(id, { refreshToken: hashed }).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { lastLoginAt: new Date() })
      .exec();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { password: hashedPassword })
      .exec();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({
      email: email.toLowerCase(),
    });
    return count > 0;
  }

  async ensureSuperAdminExists(
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    const exists = await this.existsByEmail(email);
    if (exists) return;

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.userModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    });
  }

  async findByIdOrThrow(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAllAdmin(
    query: QueryUserDto,
  ): Promise<PaginatedResult<UserDocument>> {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: QueryFilter<UserDocument> = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
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

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findByIdAdmin(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshToken')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // `currentUserId` guards against an admin editing their own role/status/
  // account through this admin surface — self-service already exists via
  // `/auth/me` + `/auth/change-password`, and letting someone demote,
  // deactivate, or delete themselves here is how you accidentally lock
  // yourself out of the CMS with no other super admin around to undo it.
  async updateRole(
    id: string,
    role: UserRole,
    currentUserId: string,
  ): Promise<UserDocument> {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');

    user.role = role;
    await user.save();

    return this.findByIdAdmin(id);
  }

  async updateStatus(
    id: string,
    status: UserStatus,
    currentUserId: string,
  ): Promise<UserDocument> {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot change your own status');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');

    user.status = status;
    await user.save();

    return this.findByIdAdmin(id);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const result = await this.userModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
