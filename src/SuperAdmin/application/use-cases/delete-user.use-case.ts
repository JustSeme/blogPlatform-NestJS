import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { UsersTypeORMRepository } from "../../infrastructure/typeORM/users-typeORM-repository"

export class DeleteUserCommand {
    constructor(
        public readonly userId: string,
    ) { }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand>{
    constructor(private usersRepository: UsersTypeORMRepository) { }

    async execute(command: DeleteUserCommand) {
        return this.usersRepository.deleteUser(command.userId)
    }
}