import { UserRole } from "../../../common/constants/app.constants";
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    type: 'access' | 'refresh';
}
export interface AuthenticatedUser {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
}
