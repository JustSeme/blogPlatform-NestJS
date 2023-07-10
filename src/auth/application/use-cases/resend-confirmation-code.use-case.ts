import { v4 as uuidv4 } from 'uuid'
import { EmailManager } from "../../../general/managers/emailManager"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { AuthRepository } from '../../infrastructure/rawSQL/auth-sql-repository'
import { add } from 'date-fns'

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
        if (!user || user.isConfirmed) return false

        const newConfirmationCode = uuidv4()

        const expirationDate = add(new Date(), {
            hours: 1,
            minutes: 3
        })

        await this.authRepository.updateEmailConfirmationInfo(user.id, newConfirmationCode, expirationDate)

        try {
            await this.emailManager.sendConfirmationCode(command.email, user.login, newConfirmationCode)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }
}