import {
    Injectable, CanActivate, ExecutionContext
} from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '../../../general/adapters/jwt.sevice'

@Injectable()
export class RefreshAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        if (!request.cookies) {
            throw new UnauthorizedException('cookie is not found')
        }

        const refreshToken = request.cookies.refreshToken
        const result = await this.jwtService.verifyRefreshToken(refreshToken)

        if (!result) {
            throw new UnauthorizedException('refreshToken is incorrect')
        }
        request.user = result

        return true
    }
}