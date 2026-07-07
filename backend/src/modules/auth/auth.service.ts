import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@modules/users/users.service';
import type { UserDocument } from '@modules/users/schemas/user.schema';
import type {
  JwtPayload,
  AuthenticatedUser,
} from './interfaces/jwt-payload.interface';
import type { LoginDto } from './dto/login.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { JwtConfig } from '@config/configuration';

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

@Injectable()
export class AuthService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtConfig = this.configService.get<JwtConfig>('jwt') as JwtConfig;
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(
      String(user._id),
      tokens.refreshToken,
    );
    await this.usersService.updateLastLogin(String(user._id));

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  async refresh(userId: string, rawRefreshToken: string): Promise<TokenPair> {
    const user = await this.usersService.findByIdWithRefreshToken(userId);

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const isValid = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(
      String(user._id),
      tokens.refreshToken,
    );

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findByIdOrThrow(userId)).email,
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.updatePassword(userId, hashed);
    await this.usersService.updateRefreshToken(userId, null);
  }

  getMe(user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  private async generateTokens(user: UserDocument): Promise<TokenPair> {
    const sub = String(user._id);

    const accessPayload: JwtPayload = {
      sub,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.jwtConfig.secret,
        expiresIn: this.jwtConfig
          .expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.jwtConfig.refreshSecret,
        expiresIn: this.jwtConfig
          .refreshExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
