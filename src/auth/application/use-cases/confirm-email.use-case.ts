import { UsersRepository } from "../../infrastructure/users-db-repository"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"

export class ConfirmEmailCommand {
    constructor(public readonly code: string) { }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
    constructor(
        private usersRepository: UsersRepository,
    ) { }

    async execute(command: ConfirmEmailCommand) {
        const user = await this.usersRepository.findUserByConfirmationCode(command.code)
        if (!user) return false

        if (!user.canBeConfirmed(command.code)) {
            return false
        }
        const isConfirmed = user.updateIsConfirmed()
        if (isConfirmed) {
            this.usersRepository.save(user)
        }
        return isConfirmed
    }
}