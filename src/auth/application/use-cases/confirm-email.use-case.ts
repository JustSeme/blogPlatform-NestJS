import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BadRequestException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { UsersSQLRepository } from "../../../SuperAdmin/infrastructure/users-sql-repository"
import { EmailConfirmationType } from "../../../SuperAdmin/domain/UsersTypes"

export class ConfirmEmailCommand {
    constructor(public readonly code: string) { }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
    constructor(
        private usersRepository: UsersSQLRepository,
    ) { }

    async execute(command: ConfirmEmailCommand) {
        const userEmailConfirmationData = await this.usersRepository.findUserEmailConfirmationDataByCode(command.code)

        if (!this.isUserCanBeConfirmed(userEmailConfirmationData, command.code) || !userEmailConfirmationData) {
            throw new BadRequestException(generateErrorsMessages('The confirmation code is incorrect, expired or already been applied', 'code'))
        }

        await this.usersRepository.updateIsConfirmedByConfirmationCode(command.code)
    }

    isUserCanBeConfirmed(emailConfirmation: EmailConfirmationType, recievedConfirmationCode: string) {
        if (emailConfirmation.isConfirmed) return false
        if (emailConfirmation.confirmationCode !== recievedConfirmationCode) return false
        if (emailConfirmation.expirationDate < new Date()) return false

        return true
    }
}