import { UserRole } from "../../../common/constants/app.constants";
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}
