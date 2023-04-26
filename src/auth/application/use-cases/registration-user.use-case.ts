import { InjectModel } from "@nestjs/mongoose"
import { User } from "../../domain/UsersSchema"
import { UserModelType } from "../../domain/UsersTypes"
import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UsersRepository } from "../../infrastructure/users-db-repository"
import { EmailManager } from "../../../general/managers/emailManager"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"

export class RegistrationUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase implements ICommandHandler<RegistrationUserCommand> {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: RegistrationUserCommand): Promise<boolean> {
        const passwordHash = await this.bcryptAdapter.generatePasswordHash(command.password, 10)

        const newUser = this.UserModel.makeInstance(command.login, command.email, passwordHash, false, this.UserModel)

        this.usersRepository.save(newUser)

        await this.emailManager.sendConfirmationCode(command.email, command.login, newUser.emailConfirmation.confirmationCode)

        return true
    }
}