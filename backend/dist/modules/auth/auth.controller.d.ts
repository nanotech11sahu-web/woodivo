import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<import("./auth.service").LoginResponse>;
    refresh(req: ExpressRequest & {
        user: {
            sub: string;
        };
    }, dto: RefreshTokenDto): Promise<import("./auth.service").TokenPair>;
    logout(user: AuthenticatedUser): Promise<void>;
    getMe(user: AuthenticatedUser): AuthenticatedUser;
    changePassword(user: AuthenticatedUser, dto: ChangePasswordDto): Promise<void>;
}
