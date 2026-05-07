import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract current user from request.
 * Usage: @CurrentUser() user: any
 * Usage: @CurrentUser('tenantId') tenantId: string
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
