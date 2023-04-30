import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UsersRepository } from "../../../general/users/infrastructure/users-db-repository"
import {
    CommandHandler,
    ICommand, ICommandHandler
} from "@nestjs/cqrs"

export class ConfirmRecoveryPasswordCommand implements ICommand {
    constructor(public readonly userId: string, public readonly newPassword: string) { }
}

@CommandHandler(ConfirmRecoveryPasswordCommand)
export class ConfirmRecoveryPasswordUseCase implements ICommandHandler<ConfirmRecoveryPasswordCommand> {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersRepository,
    ) {
    }

    async execute(command: ConfirmRecoveryPasswordCommand) {
        const {
            newPassword,
            userId
        } = command
        const newPasswordHash = await this.bcryptAdapter.generatePasswordHash(newPassword, 10)

        return this.usersRepository.updateUserPassword(userId, newPasswordHash)
    }
}