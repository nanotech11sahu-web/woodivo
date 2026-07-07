import { IsEnum } from 'class-validator';
import { UserStatus } from '../schemas/user.schema';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}
