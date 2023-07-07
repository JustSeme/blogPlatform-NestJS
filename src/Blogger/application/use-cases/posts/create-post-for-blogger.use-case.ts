import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { PostsViewModel } from "../../../../blogs/application/dto/PostViewModel"
import {
    BadRequestException, ForbiddenException
} from '@nestjs/common'
import { PostInputModelWithoutBlogId } from "../../../api/models/PostInputModelWithoutBlogId"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { PostEntity } from "../../../domain/posts/typeORM/post.entity"
import { PostsTypeORMRepository } from "../../../infrastructure/posts/typeORM/posts-typeORM-repository"

// Command
export class CreatePostForBloggerCommand implements ICommand {
    constructor(
        public readonly postInputModel: PostInputModelWithoutBlogId,
        public readonly blogId: string,
        public readonly creatorId: string,
    ) { }
}

// Command Handler
@CommandHandler(CreatePostForBloggerCommand)
export class CreatePostForBloggerUseCase implements ICommandHandler<CreatePostForBloggerCommand> {
    constructor(
        private readonly blogsRepository: BlogsQueryTypeORMRepository,
        private readonly postsRepository: PostsTypeORMRepository,
    ) { }

    async execute(command: CreatePostForBloggerCommand): Promise<PostsViewModel> {
        const {
            postInputModel,
            blogId,
            creatorId
        } = command

        const blogById = await this.blogsRepository.findOnlyUnbannedBlogById(blogId)

        if (!blogById) {
            throw new BadRequestException('This blog is banned')
        }

        if (blogById.user.id !== creatorId) {
            throw new ForbiddenException('that is not your own')
        }

        const creatingPost = new PostEntity()

        creatingPost.title = postInputModel.title
        creatingPost.shortDescription = postInputModel.shortDescription
        creatingPost.content = postInputModel.content
        creatingPost.title = postInputModel.title
        creatingPost.blog = blogById
        creatingPost.blogName = blogById.name
        creatingPost.owner = blogById.user
        creatingPost.ownerLogin = blogById.ownerLogin
        creatingPost.createdAt = new Date()

        const savedPost = await this.postsRepository.dataSourceSave(creatingPost)

        return new PostsViewModel({
            ...savedPost as PostEntity,
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: []
        })
    }
}
