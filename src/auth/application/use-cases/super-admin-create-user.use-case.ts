import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UserViewModelType } from "../dto/UsersViewModel"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "../../domain/UsersSchema"
import { UserModelType } from "../../domain/UsersTypes"
import { UsersRepository } from "../../infrastructure/users-db-repository"
import { AuthService } from "../auth.service"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"

export class SuperAdminCreateUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(SuperAdminCreateUserCommand)
export class SuperAdminCreateUserUseCase implements ICommandHandler<SuperAdminCreateUserCommand> {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersRepository,
        private authService: AuthService,
    ) { }

    async execute(command: SuperAdminCreateUserCommand): Promise<UserViewModelType | null> {
        const passwordHash = await this.bcryptAdapter.generatePasswordHash(command.password, 10)

        const newUser = this.UserModel.makeInstance(command.login, command.email, passwordHash, true, this.UserModel)

        await this.usersRepository.save(newUser)
        const displayedUser: UserViewModelType = this.authService.prepareUserForDisplay(newUser)

        return displayedUser
    }
}