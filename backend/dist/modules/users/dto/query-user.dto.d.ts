import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { UserRole } from "../../../common/constants/app.constants";
import { UserStatus } from '../schemas/user.schema';
export declare class QueryUserDto extends PaginationQueryDto {
    role?: UserRole;
    status?: UserStatus;
}
