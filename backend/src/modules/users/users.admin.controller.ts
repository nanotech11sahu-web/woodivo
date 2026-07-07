import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/constants/app.constants';
import type { AuthenticatedUser } from '@modules/auth/interfaces/jwt-payload.interface';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

// Listing/viewing is available to ADMIN and up (same bar as every other
// module's read access), but every mutation here — create, role change,
// delete — is SUPER_ADMIN-only. Status toggle is the one exception: an
// ADMIN can deactivate/reactivate an EDITOR without needing to touch
// their role, mirroring how banners/products separate `:id/status` from
// the rest of the update surface.
@Controller('admin/users')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findByIdAdmin(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  async create(@Body() dto: CreateUserDto) {
    const created = await this.usersService.create(dto);
    return this.usersService.findByIdAdmin(String(created._id));
  }

  @Patch(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.updateRole(id, dto.role, currentUser._id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.updateStatus(id, dto.status, currentUser._id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.remove(id, currentUser._id);
  }
}
