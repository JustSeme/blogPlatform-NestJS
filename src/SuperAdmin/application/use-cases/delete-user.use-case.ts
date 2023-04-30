import { UsersRepository } from "../../../general/users/infrastructure/users-db-repository"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"

export class DeleteUserCommand {
    constructor(
        public readonly userId: string,
    ) { }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand>{
    constructor(private usersRepository: UsersRepository) { }

    async execute(command: DeleteUserCommand) {
        return this.usersRepository.deleteUser(command.userId)
    }
}