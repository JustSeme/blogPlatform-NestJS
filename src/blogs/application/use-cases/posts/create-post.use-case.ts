import { ICommandHandler } from "@nestjs/cqrs"
import { PostInputModel } from "../../../../Blogger/api/models/PostInputModel"
import { PostsViewModel } from "../../dto/PostViewModel"
import { BlogsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BadRequestException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers/helpers"
import { PostEntity } from "../../../../Blogger/domain/posts/typeORM/post.entity"
import { PostsTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"

export class CreatePostCommand {
    constructor(
        public readonly body: PostInputModel,
    ) { }
}

export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
    constructor(
        private readonly blogsQueryRepository: BlogsQueryTypeORMRepository,
        private readonly postsRepository: PostsTypeORMRepository,
    ) { }

    async execute(command: CreatePostCommand): Promise<PostsViewModel> {
        const { body } = command

        const blogById = await this.blogsQueryRepository.findOnlyUnbannedBlogById(body.blogId)

        if (!blogById) {
            throw new BadRequestException(generateErrorsMessages('The blog you want to create a post for is banned', 'blogId'))
        }

        const creatingPost = new PostEntity()

        creatingPost.title = body.title
        creatingPost.shortDescription = body.shortDescription
        creatingPost.content = body.content
        creatingPost.title = body.title
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