import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@modules/users/users.service';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { JwtConfig } from '@config/configuration';

export const JWT_REFRESH_STRATEGY = 'jwt-refresh';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtConfig = configService.get<JwtConfig>('jwt');
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: jwtConfig?.refreshSecret ?? '',
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<{ sub: string }> {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);
    if (!user?.refreshToken) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    // refreshToken on the request body — validated via payload sub only here;
    // full hash comparison done in AuthService.refresh()
    const isValid = await bcrypt
      .compare(payload.sub, user.refreshToken)
      .catch(() => false);
    void isValid; // hash comparison is done in service; strategy just validates signature

    return { sub: payload.sub };
  }
}
