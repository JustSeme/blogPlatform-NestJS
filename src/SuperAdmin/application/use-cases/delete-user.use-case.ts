import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { UsersSQLRepository } from "../../infrastructure/rawSQL/users-sql-repository"

export class DeleteUserCommand {
    constructor(
        public readonly userId: string,
    ) { }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand>{
    constructor(private usersRepository: UsersSQLRepository) { }

    async execute(command: DeleteUserCommand) {
        return this.usersRepository.deleteUser(command.userId)
    }
}