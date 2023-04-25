import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "../../domain/UsersSchema"
import { UserModelType } from "../../domain/UsersTypes"
import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UsersRepository } from "../../infrastructure/users-db-repository"
import { EmailManager } from "../../../general/managers/emailManager"

@Injectable()
export class RegistrationUserUseCase {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersRepository,
        private emailManager: EmailManager
    ) { }

    async execute(login: string, password: string, email: string): Promise<boolean> {
        const passwordHash = await this.bcryptAdapter.generatePasswordHash(password, 10)

        const newUser = this.UserModel.makeInstance(login, email, passwordHash, false, this.UserModel)

        this.usersRepository.save(newUser)

        await this.emailManager.sendConfirmationCode(email, login, newUser.emailConfirmation.confirmationCode)

        return true
    }
}