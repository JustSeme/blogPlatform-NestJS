import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { UsersRepository } from "../../../general/users/infrastructure/users-db-repository"

export class UnbanUserCommand {
    constructor(
        public readonly userId: string,
    ) { }
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
    constructor(
        private usersRepository: UsersRepository,
    ) { }

    async execute(command: UnbanUserCommand) {
        const { userId } = command

        const userById = await this.usersRepository.findUserById(userId)

        const isUnbanned = userById.unbanCurrentUser()
        if (isUnbanned) {
            this.usersRepository.save(userById)
        }
    }
}