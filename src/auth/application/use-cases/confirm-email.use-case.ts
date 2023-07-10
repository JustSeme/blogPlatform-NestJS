import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BadRequestException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { AuthTypeORMRepository } from "../../infrastructure/typeORM/auth-typeORM-repository"
import { UserEmailConfirmation } from "../../../SuperAdmin/domain/typeORM/user-email-confirmation.entity"
import { AuthQueryTypeORMRepository } from "../../infrastructure/typeORM/auth-query-typeORM-repository"

export class ConfirmEmailCommand {
    constructor(public readonly code: string) { }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
    constructor(
        private authRepository: AuthTypeORMRepository,
        private authQueryRepository: AuthQueryTypeORMRepository
    ) { }

    async execute(command: ConfirmEmailCommand) {
        const userEmailConfirmationData = await this.authQueryRepository.findUserEmailConfirmationDataByCode(command.code)

        if (!this.isUserCanBeConfirmed(userEmailConfirmationData, command.code) || !userEmailConfirmationData) {
            throw new BadRequestException(generateErrorsMessages('The confirmation code is incorrect, expired or already been applied', 'code'))
        }

        userEmailConfirmationData.isEmailConfirmed = true

        const savedUserEmailConfirmtaionData = await this.authRepository.dataSourceSave(userEmailConfirmationData)

        return savedUserEmailConfirmtaionData ? true : false
    }

    isUserCanBeConfirmed(emailConfirmation: UserEmailConfirmation, recievedConfirmationCode: string) {
        if (!emailConfirmation) return false
        if (emailConfirmation.isEmailConfirmed) return false
        if (emailConfirmation.emailConfirmationCode !== recievedConfirmationCode) return false
        if (emailConfirmation.emailExpirationDate < new Date()) {
            return false
        }

        return true
    }
}