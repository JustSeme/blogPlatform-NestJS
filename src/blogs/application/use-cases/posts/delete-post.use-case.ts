import {
    CommandHandler,
    ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { PostsTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"

// Command
export class DeletePostsCommand implements ICommand {
    constructor(public readonly id: string) { }
}

// Command Handler
@CommandHandler(DeletePostsCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostsCommand> {
    constructor(private readonly postsRepository: PostsTypeORMRepository) { }


    async execute(command: DeletePostsCommand) {
        const { id } = command
        return this.postsRepository.deletePost(id)
    }
}