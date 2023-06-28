import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { ForbiddenException } from '@nestjs/common'
import { PostInputModelWithoutBlogId } from "../../../api/models/PostInputModelWithoutBlogId"
import { PostInputModel } from "../../../api/models/PostInputModel"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/rawSQL/blogs-sql-repository"
import { PostsSQLRepository } from "../../../infrastructure/posts/posts-sql-repository"

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
        private readonly blogsRepository: BlogsSQLRepository,
        private readonly postsRepository: PostsSQLRepository,
    ) { }

    async execute(command: UpdatePostForBloggerCommand): Promise<boolean> {
        const {
            postInputModel,
            blogId,
            postId,
            creatorId,
        } = command

        const blogById = await this.blogsRepository.findBlogById(blogId)

        if (blogById.user !== creatorId) {
            throw new ForbiddenException('that is not your own')
        }

        const postInputModelWithBlogId: PostInputModel = {
            ...postInputModel, blogId
        }

        return this.postsRepository.updatePost(postId, postInputModelWithBlogId)
    }
}
