import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { UserRole } from '@common/constants/app.constants';
import { UserStatus } from '../schemas/user.schema';

export class QueryUserDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
