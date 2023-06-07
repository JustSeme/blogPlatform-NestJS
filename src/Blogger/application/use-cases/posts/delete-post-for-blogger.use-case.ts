import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ForbiddenException } from "@nestjs/common"
import { PostsRepository } from "../../../infrastructure/posts/posts-db-repository"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/blogs-sql-repository"

export class DeletePostForBloggerCommand {
    constructor(
        public readonly blogId: string,
        public readonly postId: string,
        public readonly userId: string,
    ) { }
}


@CommandHandler(DeletePostForBloggerCommand)
export class DeletePostForBloggerUseCase implements ICommandHandler<DeletePostForBloggerCommand> {
    constructor(
        private blogsRepository: BlogsSQLRepository,
        private postsRepository: PostsRepository,
    ) { }

    async execute(command: DeletePostForBloggerCommand) {
        const blogById = await this.blogsRepository.findBlogById(command.blogId)
        if (blogById.blogOwnerInfo.userId !== command.userId) {
            throw new ForbiddenException('this is not your own')
        }

        return this.postsRepository.deletePost(command.postId)
    }
}