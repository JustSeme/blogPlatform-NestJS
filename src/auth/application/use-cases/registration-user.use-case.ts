import { InjectModel } from "@nestjs/mongoose"
import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { EmailManager } from "../../../general/managers/emailManager"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { UserModelType } from "../../../SuperAdmin/domain/UsersTypes"
import { User } from "../../../SuperAdmin/domain/UsersSchema"
import { UsersRepository } from "../../../SuperAdmin/infrastructure/users-db-repository"

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

        console.log('new user', newUser)

        await this.usersRepository.save(newUser)

        await this.emailManager.sendConfirmationCode(command.email, command.login, newUser.emailConfirmation.confirmationCode)

        return true
    }
}