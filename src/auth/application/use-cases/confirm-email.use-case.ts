import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BadRequestException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { EmailConfirmationType } from "../../../SuperAdmin/domain/UsersTypes"
import { AuthRepository } from "../../infrastructure/auth-sql-repository"

export class ConfirmEmailCommand {
    constructor(public readonly code: string) { }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
    constructor(
        private authRepository: AuthRepository,
    ) { }

    async execute(command: ConfirmEmailCommand) {
        const userEmailConfirmationData = await this.authRepository.findUserEmailConfirmationDataByCode(command.code)

        if (!this.isUserCanBeConfirmed(userEmailConfirmationData, command.code) || !userEmailConfirmationData) {
            throw new BadRequestException(generateErrorsMessages('The confirmation code is incorrect, expired or already been applied', 'code'))
        }

        await this.authRepository.updateIsConfirmedByConfirmationCode(command.code)
    }

    isUserCanBeConfirmed(emailConfirmation: EmailConfirmationType, recievedConfirmationCode: string) {
        if (!emailConfirmation) return false
        if (emailConfirmation.isConfirmed) return false
        if (emailConfirmation.confirmationCode !== recievedConfirmationCode) return false
        if (emailConfirmation.expirationDate < new Date()) {
            console.log(emailConfirmation.expirationDate, new Date())

            return false
        }

        return true
    }
}