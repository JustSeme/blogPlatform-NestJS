import {
    Injectable, UnauthorizedException
} from "@nestjs/common"
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UsersRepository } from "../../../SuperAdmin/infrastructure/users-db-repository"
import { User } from "../../../SuperAdmin/domain/UsersSchema"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usersRepository: UsersRepository,
        private bcryptAdapter: BcryptAdapter,
    ) {
        super({ usernameField: 'loginOrEmail' })
    }

    async validate(loginOrEmail: string, password: string): Promise<User> {
        const user = await this.checkCredentials(loginOrEmail, password)
        if (!user) {
            throw new UnauthorizedException('User is not found, or email is not confirmed, or password is incorrect')
        }
        return user
    }

    private async checkCredentials(loginOrEmail: string, password: string) {
        const user = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) return false
        if (!user.emailConfirmation.isConfirmed) return false

        const isConfirmed = await this.bcryptAdapter.comparePassword(password, user.passwordHash)
        if (isConfirmed) {
            return user
        }
    }
}