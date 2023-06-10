import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import {
    CommandHandler,
    ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { generateErrorsMessages } from "../../../general/helpers"
import { BadRequestException } from '@nestjs/common'
import { AuthRepository } from "../../infrastructure/auth-sql-repository"

export class ConfirmRecoveryPasswordCommand implements ICommand {
    constructor(public readonly recoveryCode: string, public readonly newPassword: string) { }
}

@CommandHandler(ConfirmRecoveryPasswordCommand)
export class ConfirmRecoveryPasswordUseCase implements ICommandHandler<ConfirmRecoveryPasswordCommand> {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private authRepository: AuthRepository,
    ) {
    }

    async execute(command: ConfirmRecoveryPasswordCommand) {
        const {
            newPassword,
            recoveryCode
        } = command

        const user = await this.authRepository.findUserDataWithPasswordRecovery(recoveryCode)

        if (!user || user.passwordRecoveryExpirationDate < new Date()) {
            throw new BadRequestException(generateErrorsMessages('recoveryCode is incorrect', 'recoveryCode'))
        }

        const newPasswordHash = await this.bcryptAdapter.generatePasswordHash(newPassword, 10)

        return this.authRepository.updateUserPassword(user.id, newPasswordHash)
    }
}