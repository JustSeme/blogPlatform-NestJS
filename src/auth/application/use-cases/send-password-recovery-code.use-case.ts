import { EmailManager } from "../../../general/managers/emailManager"
import { UsersRepository } from "../../infrastructure/users-db-repository"
import { v4 as uuidv4 } from 'uuid'
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"

export class SendPasswordRecoveryCodeCommand {
    constructor(public email: string) { }
}

@CommandHandler(SendPasswordRecoveryCodeCommand)
export class SendPasswordRecoveryCodeUseCase implements ICommandHandler<SendPasswordRecoveryCodeCommand> {
    constructor(
        private usersRepository: UsersRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: SendPasswordRecoveryCodeCommand) {
        const user = await this.usersRepository.findUserByEmail(command.email)
        if (!user) {
            return true
        }
        const passwordRecoveryCode = uuidv4()

        await this.emailManager.sendPasswordRecoveryCode(user.email, user.login, passwordRecoveryCode)

        const isUpdated = await this.usersRepository.updatePasswordConfirmationInfo(user.id, passwordRecoveryCode)
        if (!isUpdated) {
            return false
        }
        return true
    }
}