import { UserViewModelType } from './dto/UsersViewModel'
import { UsersRepository } from '../infrastructure/users-db-repository'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose/dist'
import { User } from '../domain/UsersSchema'
import {
    UserDTO, UserModelType
} from '../domain/UsersTypes'
import { EmailManager } from '../../general/managers/emailManager'
import { BcryptAdapter } from '../../general/adapters/bcrypt.adapter'
import { JwtService } from '../../general/adapters/jwt.adapter'
import { AuthConfig } from '../../configuration/auth.config'


//transaction script
@Injectable()
export class AuthService {

    constructor(@InjectModel(User.name) private UserModel: UserModelType,
        protected usersRepository: UsersRepository,
        protected jwtService: JwtService,
        protected emailManager: EmailManager,
        private bcryptAdapter: BcryptAdapter,
        private readonly authConfig: AuthConfig
    ) { }

    async createUser(login: string, password: string, email: string): Promise<boolean> {
        const passwordHash = await this.bcryptAdapter.generatePasswordHash(password, 10)

        const newUser = this.UserModel.makeInstance(login, email, passwordHash, false, this.UserModel)

        this.usersRepository.save(newUser)

        await this.emailManager.sendConfirmationCode(email, login, newUser.emailConfirmation.confirmationCode)

        return true
    }

    async deleteUser(userId: string) {
        return this.usersRepository.deleteUser(userId)
    }

    public prepareUserForDisplay(newUser: UserDTO): UserViewModelType {
        return {
            id: newUser.id,
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt
        }
    }
}