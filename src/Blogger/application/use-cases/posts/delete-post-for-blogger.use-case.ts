import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import {
    BadRequestException, ForbiddenException
} from "@nestjs/common"
import { PostsSQLRepository } from "../../../infrastructure/posts/rawSQL/posts-sql-repository"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"

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
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
        private postsRepository: PostsSQLRepository,
    ) { }

    async execute(command: DeletePostForBloggerCommand) {
        const blogById = await this.blogsQueryRepository.findOnlyUnbannedBlogById(command.blogId)

        if (!blogById) {
            throw new BadRequestException('This blog is banned')
        }

        if (blogById.user.id !== command.userId) {
            throw new ForbiddenException('this is not your own')
        }

        return this.postsRepository.deletePost(command.postId)
    }
}