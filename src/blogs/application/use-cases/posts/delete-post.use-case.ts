import {
    CommandHandler,
    ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { PostsRepository } from "../../../infrastructure/posts/posts-db-repository"

// Command
export class DeletePostsCommand implements ICommand {
    constructor(public readonly id: string) { }
}

// Command Handler
@CommandHandler(DeletePostsCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostsCommand> {
    constructor(private readonly postsRepository: PostsRepository) { }


    async execute(command: DeletePostsCommand) {
        const { id } = command
        return this.postsRepository.deletePost(id)
    }
}