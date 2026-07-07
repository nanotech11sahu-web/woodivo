import { IsEnum } from 'class-validator';
import { UserRole } from '@common/constants/app.constants';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
