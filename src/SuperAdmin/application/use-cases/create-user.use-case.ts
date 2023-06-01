import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UserViewModelType } from "../dto/UsersViewModel"
import { InjectModel } from "@nestjs/mongoose"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { UserModelType } from "../../domain/UsersTypes"
import { User } from "../../domain/UsersSchema"
import { UsersRepository } from "../../infrastructure/users-db-repository"
import { UsersService } from "../users.service"

export class CreateUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersRepository,
        private usersService: UsersService,
    ) { }

    async execute(command: CreateUserCommand): Promise<UserViewModelType | null> {
        const passwordHash = await this.bcryptAdapter.generatePasswordHash(command.password, 10)

        const newUser = this.UserModel.makeInstance(command.login, command.email, passwordHash, true, this.UserModel)

        await this.usersRepository.save(newUser)
        const displayedUser: UserViewModelType = this.usersService.prepareUserForDisplay(newUser)

        return displayedUser
    }
}