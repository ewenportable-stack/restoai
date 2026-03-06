import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRecord } from '../../modules/users/users.service';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserRecord => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserRecord;
  },
);
