import { v4 as uuidv4 } from 'uuid'
import { EmailManager } from "../../../general/managers/emailManager"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { AuthRepository } from '../../infrastructure/auth-sql-repository'

export class ResendConfirmationCodeCommand {
    constructor(public email: string) { }
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase implements ICommandHandler<ResendConfirmationCodeCommand> {
    constructor(
        private authRepository: AuthRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: ResendConfirmationCodeCommand) {
        const user = await this.authRepository.findUserByEmail(command.email)
        if (!user || user.emailConfirmation.isConfirmed) return false

        console.log(user, 'user confirmation code')

        const newConfirmationCode = uuidv4()

        console.log(newConfirmationCode, 'new confirmation code')

        await this.authRepository.updateEmailConfirmationInfo(user.id, newConfirmationCode)

        try {
            await this.emailManager.sendConfirmationCode(command.email, user.login, newConfirmationCode)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }
}