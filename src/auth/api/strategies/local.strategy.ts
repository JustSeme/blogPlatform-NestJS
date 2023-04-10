import {
    Injectable, UnauthorizedException
} from "@nestjs/common"
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from "src/auth/application/auth-service"
import { User } from "src/auth/domain/UsersSchema"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'loginOrEmail' })
    }

    async validate(loginOrEmail: string, password: string): Promise<User> {
        const user = await this.authService.checkCredentials(loginOrEmail, password)
        if (!user) {
            throw new UnauthorizedException()
        }
        return user
    }
}