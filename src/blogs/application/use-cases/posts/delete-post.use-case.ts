import {
    CommandHandler,
    ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { PostsSQLRepository } from "../../../../Blogger/infrastructure/posts/rawSQL/posts-sql-repository"

// Command
export class DeletePostsCommand implements ICommand {
    constructor(public readonly id: string) { }
}

// Command Handler
@CommandHandler(DeletePostsCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostsCommand> {
    constructor(private readonly postsRepository: PostsSQLRepository) { }


    async execute(command: DeletePostsCommand) {
        const { id } = command
        return this.postsRepository.deletePost(id)
    }
}