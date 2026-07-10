import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from "../users/users.service";
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import type { LoginDto } from './dto/login.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface LoginResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    tokens: TokenPair;
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly jwtConfig;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    login(dto: LoginDto): Promise<LoginResponse>;
    refresh(userId: string, rawRefreshToken: string): Promise<TokenPair>;
    logout(userId: string): Promise<void>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    getMe(user: AuthenticatedUser): AuthenticatedUser;
    private generateTokens;
}
