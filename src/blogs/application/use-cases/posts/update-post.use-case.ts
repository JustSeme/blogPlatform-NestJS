import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { PostInputModel } from "../../../../Blogger/api/models/PostInputModel"
import { PostsRepository } from "../../../../Blogger/infrastructure/posts/mongoose/posts-db-repository"

// Define the Command
export class UpdatePostCommand {
    constructor(public postId: string, public postInputModel: PostInputModel) { }
}

// Define the CommandHandler
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
    constructor(private postsRepository: PostsRepository) { }

    async execute(command: UpdatePostCommand) {
        return this.postsRepository.updatePost(command.postId, command.postInputModel)
    }
}
