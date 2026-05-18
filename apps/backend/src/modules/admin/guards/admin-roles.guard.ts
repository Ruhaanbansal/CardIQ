import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminPermission, AdminRole, ROLE_PERMISSIONS } from '../interfaces/admin.interface';

export const ROLES_KEY = 'required_permissions';
export const Permissions = (...permissions: AdminPermission[]) =>
  SetMetadata(ROLES_KEY, permissions);

export interface AdminJwtPayload {
  sub: string;
  email: string;
  role: AdminRole;
  sessionId: string;
}

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AdminPermission[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No permission requirement = allow (public admin info)
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const admin: AdminJwtPayload = request.admin;

    if (!admin) throw new ForbiddenException('Admin authentication required.');

    const granted = ROLE_PERMISSIONS[admin.role] ?? [];
    const hasAll = required.every(p => granted.includes(p));

    if (!hasAll) {
      throw new ForbiddenException(
        `Role "${admin.role}" lacks required permission(s): ${required.filter(p => !granted.includes(p)).join(', ')}.`,
      );
    }

    return true;
  }
}
