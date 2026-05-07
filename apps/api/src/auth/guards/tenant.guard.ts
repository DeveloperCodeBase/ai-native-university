import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Ensures the authenticated user can only access resources
 * belonging to their own tenant. Checks the `tenantId` param
 * in the request against the user's tenantId from JWT.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('احراز هویت الزامی است');
    }

    // super_admin can access any tenant
    if (user.role === 'super_admin') {
      return true;
    }

    // Check tenantId in route params, query, or body
    const requestTenantId =
      request.params?.tenantId ||
      request.query?.tenantId ||
      request.body?.tenantId;

    if (requestTenantId && requestTenantId !== user.tenantId) {
      throw new ForbiddenException('دسترسی به داده‌های سازمان دیگر مجاز نیست');
    }

    return true;
  }
}
