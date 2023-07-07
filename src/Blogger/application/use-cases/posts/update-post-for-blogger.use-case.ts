import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import {
    BadRequestException, ForbiddenException
} from '@nestjs/common'
import { PostInputModelWithoutBlogId } from "../../../api/models/PostInputModelWithoutBlogId"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { PostsQueryTypeORMRepository } from "../../../infrastructure/posts/typeORM/posts-query-typeORM-repository"
import { PostsTypeORMRepository } from "../../../infrastructure/posts/typeORM/posts-typeORM-repository"

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
        private readonly postsQueryRepository: PostsQueryTypeORMRepository,
        private readonly postsRepository: PostsTypeORMRepository,
    ) { }

    async execute(command: UpdatePostForBloggerCommand): Promise<boolean> {
        const {
            postInputModel,
            blogId,
            postId,
            creatorId,
        } = command

        const blogById = await this.blogsQueryRepository.findOnlyUnbannedBlogById(blogId)

        if (!blogById) {
            throw new BadRequestException('This blog is banned')
        }

        if (blogById.user.id !== creatorId) {
            throw new ForbiddenException('That is not your own')
        }

        const postById = await this.postsQueryRepository.getPostById(postId)

        postById.blog = blogById
        postById.title = postInputModel.title
        postById.shortDescription = postInputModel.shortDescription
        postById.content = postInputModel.content

        const savedPost = this.postsRepository.dataSourceSave(postById)

        return savedPost ? true : false
    }
}
