import {
    Injectable, CanActivate, ExecutionContext, UnauthorizedException
} from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class BasicAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext,): boolean {
        const request: Request = context.switchToHttp().getRequest()
        const authStr = btoa('admin:qwerty')

        if (request.headers.authorization !== `Basic ${authStr}`) {
            throw new UnauthorizedException()
        }

        return true
    }
}