import {
    Injectable, UnauthorizedException
} from "@nestjs/common"
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { AuthRepository } from "../../infrastructure/auth-sql-repository"
import { UserDBModel } from "../../../SuperAdmin/infrastructure/UsersTypes"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authRepository: AuthRepository,
        private bcryptAdapter: BcryptAdapter,
    ) {
        super({ usernameField: 'loginOrEmail' })
    }

    async validate(loginOrEmail: string, password: string): Promise<UserDBModel> {
        const user = await this.checkCredentials(loginOrEmail, password)
        if (!user) {
            throw new UnauthorizedException('User is not found, or email is not confirmed, or password is incorrect')
        }
        return user
    }

    private async checkCredentials(loginOrEmail: string, password: string) {
        const user = await this.authRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) return false
        if (!user.emailConfirmation.isConfirmed) return false


        const isConfirmed = await this.bcryptAdapter.comparePassword(password, user.passwordHash)
        if (isConfirmed) {
            return user
        }
    }
}