import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { ForbiddenException } from '@nestjs/common'
import { PostInputModelWithoutBlogId } from "../../../api/models/PostInputModelWithoutBlogId"
import { PostInputModel } from "../../../api/models/PostInputModel"
import { PostsSQLRepository } from "../../../infrastructure/posts/posts-sql-repository"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"

// Command
export class UpdatePostForBloggerCommand implements ICommand {
    constructor(
        public readonly postInputModel: PostInputModelWithoutBlogId,
        public readonly blogId: string,
        public readonly postId: string,
        public readonly creatorId: string,
    ) { }
}

// Command Handler
@CommandHandler(UpdatePostForBloggerCommand)
export class UpdatePostForBloggerUseCase implements ICommandHandler<UpdatePostForBloggerCommand> {
    constructor(
        private readonly blogsQueryRepository: BlogsQueryTypeORMRepository,
        private readonly postsRepository: PostsSQLRepository,
    ) { }

    async execute(command: UpdatePostForBloggerCommand): Promise<boolean> {
        const {
            postInputModel,
            blogId,
            postId,
            creatorId,
        } = command

        const blogById = await this.blogsQueryRepository.findBlogById(blogId)

        if (blogById.user.id !== creatorId) {
            throw new ForbiddenException('that is not your own')
        }

        const postInputModelWithBlogId: PostInputModel = {
            ...postInputModel, blogId
        }

        return this.postsRepository.updatePost(postId, postInputModelWithBlogId)
    }
}
