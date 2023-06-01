import { EmailManager } from "../../../general/managers/emailManager"
import { v4 as uuidv4 } from 'uuid'
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { AuthRepository } from "../../infrastructure/auth-sql-repository"

export class SendPasswordRecoveryCodeCommand {
    constructor(public email: string) { }
}

@CommandHandler(SendPasswordRecoveryCodeCommand)
export class SendPasswordRecoveryCodeUseCase implements ICommandHandler<SendPasswordRecoveryCodeCommand> {
    constructor(
        private authRepository: AuthRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: SendPasswordRecoveryCodeCommand) {
        const user = await this.authRepository.findUserByEmail(command.email)
        if (!user) {
            return true
        }
        const passwordRecoveryCode = uuidv4()

        await this.emailManager.sendPasswordRecoveryCode(user.email, user.login, passwordRecoveryCode)

        const isUpdated = await this.authRepository.updatePasswordConfirmationInfo(user.id, passwordRecoveryCode)
        if (!isUpdated) {
            return false
        }
        return true
    }
}