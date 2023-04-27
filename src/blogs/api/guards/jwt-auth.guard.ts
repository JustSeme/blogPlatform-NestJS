import {
    CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from "@nestjs/common"
import { JwtService } from "../../../general/adapters/jwt.adapter"
import { generateErrorsMessages } from "../../../general/helpers"

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest()

        if (!request.headers.authorization) {
            throw new UnauthorizedException(generateErrorsMessages('token is not found', 'bearer token from header'))
        }

        const token = request.headers.authorization.split(' ')[1]

        const userId = await this.jwtService.getUserIdByToken(token)

        if (!userId) {
            throw new UnauthorizedException(generateErrorsMessages('token is incorrect', 'bearer token from header'))
        }

        request.user = { userId }

        return true
    }
}