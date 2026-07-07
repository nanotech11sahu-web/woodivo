import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { UserRole } from '@common/constants/app.constants';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
import type { AuthenticatedUser } from '@modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.EDITOR]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPER_ADMIN]: 3,
    };

    const userLevel = roleHierarchy[user.role] ?? 0;
    const requiredLevel = Math.min(
      ...requiredRoles.map((r) => roleHierarchy[r] ?? 0),
    );

    if (userLevel < requiredLevel) {
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
