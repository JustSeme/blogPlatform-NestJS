import {
    Injectable, CanActivate, ExecutionContext, UnauthorizedException
} from '@nestjs/common'
import { Request } from 'express'
import { JwtService } from 'src/adapters/jwtService'

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(protected jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest()

        const token = request.headers.authorization.split(' ')[1]

        const verifyResult = await this.jwtService.verifyAccessToken(token)

        if (!verifyResult) {
            throw new UnauthorizedException()
        }

        return true
    }
}