import {
    CanActivate, ExecutionContext, Injectable
} from "@nestjs/common"
import { JwtService } from "../adapters/jwt.adapter"

@Injectable()
export class JwtGetUserId implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest()

        if (!request.headers.authorization) {
            request.user = { userId: null }
            return true
        }

        const token = request.headers.authorization.split(' ')[1]

        const userId = await this.jwtService.getUserIdByToken(token)

        request.user = { userId: userId ? userId : null }

        return true
    }
}