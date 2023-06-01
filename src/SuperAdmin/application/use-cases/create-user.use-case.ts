import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UserViewModelType } from "../dto/UsersViewModel"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { UserDTO } from "../../domain/UsersTypes"
import { UsersService } from "../users.service"
import { UsersSQLRepository } from "../../infrastructure/users-sql-repository"
import { AuthRepository } from "../../../auth/infrastructure/auth-sql-repository"
import { FieldError } from "../../../general/types/ErrorMessagesOutputModel"
import { BadRequestException } from "@nestjs/common"

export class CreateUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersSQLRepository,
        private usersService: UsersService,
        private authRepository: AuthRepository
    ) { }

    async execute(command: CreateUserCommand): Promise<UserViewModelType | null> {
        // if login or email is already in use - throw 400 error
        await this.isEmailOrLoginAlreadyUsed(command.login, command.email)

        const passwordHash = await this.bcryptAdapter.generatePasswordHash(command.password, 10)

        const newUser = new UserDTO(command.login, command.email, passwordHash, true)

        await this.usersRepository.createNewUser(newUser)
        const displayedUser: UserViewModelType = this.usersService.prepareUserForDisplay(newUser)

        return displayedUser
    }

    async isEmailOrLoginAlreadyUsed(login: string, email: string) {
        const isUserByLoginExists = await this.authRepository.isUserByLoginExists(login)
        const isUserByEmailExists = await this.authRepository.isUserByEmailExists(email)

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