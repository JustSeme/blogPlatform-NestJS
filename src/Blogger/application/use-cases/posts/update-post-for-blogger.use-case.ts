import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { PostsRepository } from "../../../../blogs/infrastructure/posts/posts-db-repository"
import { PostsService } from "../../../../blogs/application/posts-service"
import { BlogsRepository } from "../../../../blogs/infrastructure/blogs/blogs-db-repository"
import { ForbiddenException } from '@nestjs/common'
import { PostInputModelWithoutBlogId } from "../../../../blogs/api/models/PostInputModelWithoutBlogId"
import { PostInputModel } from "../../../../blogs/api/models/PostInputModel"

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
        private readonly blogsRepository: BlogsRepository,
        private readonly postsRepository: PostsRepository,
        private readonly postsService: PostsService,
    ) { }

    async execute(command: UpdatePostForBloggerCommand): Promise<boolean> {
        const {
            postInputModel,
            blogId,
            postId,
            creatorId,
        } = command

        const blogById = await this.blogsRepository.findBlogById(blogId)

        if (blogById.blogOwnerInfo.userId !== creatorId) {
            throw new ForbiddenException('that is not your own')
        }

        const postInputModelWithBlogId: PostInputModel = {
            ...postInputModel, blogId
        }

        await this.postsRepository.updatePost(postId, postInputModelWithBlogId)

        return true
    }
}
