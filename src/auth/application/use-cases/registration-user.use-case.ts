import { InjectModel } from "@nestjs/mongoose"
import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { EmailManager } from "../../../general/managers/emailManager"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { UserModelType } from "../../../SuperAdmin/domain/UsersTypes"
import { User } from "../../../SuperAdmin/domain/UsersSchema"
import { FieldError } from "../../../general/types/ErrorMessagesOutputModel"
import { BadRequestException } from '@nestjs/common'
import { AuthRepository } from "../../infrastructure/auth-sql-repository"
import { UsersSQLRepository } from "../../../SuperAdmin/infrastructure/users-sql-repository"

export class RegistrationUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase implements ICommandHandler<RegistrationUserCommand> {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
        private bcryptAdapter: BcryptAdapter,
        private authRepository: AuthRepository,
        private usersRepository: UsersSQLRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: RegistrationUserCommand): Promise<boolean> {
        // if already used - throw bad request exception 
        await this.isEmailOrLoginAlreadyUsed(command.login, command.email)

        const passwordHash = await this.bcryptAdapter.generatePasswordHash(command.password, 10)

        const newUser = this.UserModel.makeInstance(command.login, command.email, passwordHash, false, this.UserModel)

        await this.usersRepository.createNewUser(newUser)

        await this.emailManager.sendConfirmationCode(command.email, command.login, newUser.emailConfirmation.confirmationCode)

        return true
    }

    async isEmailOrLoginAlreadyUsed(login: string, email: string) {
        const isUserByLoginExists = await this.authRepository.isUserByLoginExists(login)
        const isUserByEmailExists = await this.authRepository.isUserByEmailExists(email)

        console.log(isUserByLoginExists, isUserByEmailExists)


        if (isUserByLoginExists || isUserByEmailExists) {
            const errorsMessages: FieldError[] = []

            if (isUserByLoginExists) {
                errorsMessages.push({
                    message: 'Login is already exist',
                    field: 'login'
                })
            }

            if (isUserByEmailExists) {
                errorsMessages.push({
                    message: 'Email is already exist',
                    field: 'email'
                })
            }

            throw new BadRequestException(errorsMessages)
        }
    }
}