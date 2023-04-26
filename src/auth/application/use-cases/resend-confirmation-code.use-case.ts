import { UsersRepository } from "../../infrastructure/users-db-repository"
import { v4 as uuidv4 } from 'uuid'
import { EmailManager } from "../../../general/managers/emailManager"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"

export class ResendConfirmationCodeCommand {
    constructor(public email: string) { }
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase implements ICommandHandler<ResendConfirmationCodeCommand> {
    constructor(
        private usersRepository: UsersRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: ResendConfirmationCodeCommand) {
        const user = await this.usersRepository.findUserByEmail(command.email)
        if (!user || user.emailConfirmation.isConfirmed) return false

        const newConfirmationCode = uuidv4()
        await this.usersRepository.updateEmailConfirmationInfo(user.id, newConfirmationCode)

        try {
            return await this.emailManager.sendConfirmationCode(command.email, user.login, newConfirmationCode)
        } catch (error) {
            console.error(error)
            this.usersRepository.deleteUser(user.id)
            return false
        }
    }
}