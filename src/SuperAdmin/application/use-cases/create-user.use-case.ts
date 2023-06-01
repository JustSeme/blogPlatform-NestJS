import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UserViewModelType } from "../dto/UsersViewModel"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { UserDTO } from "../../domain/UsersTypes"
import { UsersService } from "../users.service"
import { UsersSQLRepository } from "../../infrastructure/users-sql-repository"

export class CreateUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersSQLRepository,
        private usersService: UsersService,
    ) { }

    async execute(command: CreateUserCommand): Promise<UserViewModelType | null> {
        const passwordHash = await this.bcryptAdapter.generatePasswordHash(command.password, 10)

        const newUser = new UserDTO(command.login, command.email, passwordHash, true)

        await this.usersRepository.createNewUser(newUser)
        const displayedUser: UserViewModelType = this.usersService.prepareUserForDisplay(newUser)

        return displayedUser
    }
}