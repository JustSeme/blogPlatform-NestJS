import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import {
    CommandHandler,
    ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { generateErrorsMessages } from "../../../general/helpers"
import { BadRequestException } from '@nestjs/common'
import { UsersSQLRepository } from "../../../SuperAdmin/infrastructure/users-sql-repository"

export class ConfirmRecoveryPasswordCommand implements ICommand {
    constructor(public readonly recoveryCode: string, public readonly newPassword: string) { }
}

@CommandHandler(ConfirmRecoveryPasswordCommand)
export class ConfirmRecoveryPasswordUseCase implements ICommandHandler<ConfirmRecoveryPasswordCommand> {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersSQLRepository,
    ) {
    }

    async execute(command: ConfirmRecoveryPasswordCommand) {
        const {
            newPassword,
            recoveryCode
        } = command

        const user = await this.usersRepository.findUserByRecoveryPasswordCode(recoveryCode)

        if (!user || user.passwordRecovery.expirationDate < new Date()) {
            throw new BadRequestException(generateErrorsMessages('recoveryCode is incorrect', 'recoveryCode'))
        }

        const newPasswordHash = await this.bcryptAdapter.generatePasswordHash(newPassword, 10)

        return this.usersRepository.updateUserPassword(user.id, newPasswordHash)
    }
}