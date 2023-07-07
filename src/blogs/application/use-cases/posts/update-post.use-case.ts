import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { PostInputModel } from "../../../../Blogger/api/models/PostInputModel"
import { PostsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository"
import { PostsTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"

// Define the Command
export class UpdatePostCommand {
    constructor(public postId: string, public postInputModel: PostInputModel) { }
}

// Define the CommandHandler
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
    constructor(
        private postsQueryRepository: PostsQueryTypeORMRepository,
        private postsRepository: PostsTypeORMRepository
    ) { }

    async execute(command: UpdatePostCommand) {
        const postById = await this.postsQueryRepository.getPostById(command.postId)

        postById.title = command.postInputModel.title
        postById.shortDescription = command.postInputModel.shortDescription
        postById.content = command.postInputModel.content

        return this.postsRepository.dataSourceSave(postById)
    }
}
