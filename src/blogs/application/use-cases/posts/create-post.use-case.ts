import { ICommandHandler } from "@nestjs/cqrs"
import { PostInputModel } from "../../../../Blogger/api/models/PostInputModel"
import { PostsRepository } from "../../../../Blogger/infrastructure/posts/posts-db-repository"
import { PostsService } from "../../posts-service"
import { PostDTO } from "../../../../Blogger/domain/posts/PostsTypes"
import { PostsViewModel } from "../../dto/PostViewModel"
import { BlogsSQLRepository } from "../../../../Blogger/infrastructure/blogs/blogs-sql-repository"

export class CreatePostCommand {
    constructor(
        public readonly body: PostInputModel,
    ) { }
}

export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
    constructor(
        private readonly blogsRepository: BlogsSQLRepository,
        private readonly postsRepository: PostsRepository,
        private readonly postsService: PostsService,
    ) { }

    async execute(command: CreatePostCommand): Promise<PostsViewModel> {
        const { body, } = command

        const blogById = await this.blogsRepository.findBlogById(body.blogId)

        const createdPost: PostDTO = new PostDTO(
            body.title,
            body.shortDescription,
            body.content,
            blogById.id,
            blogById?.name ? blogById?.name : 'not found',
            blogById.blogOwnerInfo.userId,
            blogById.blogOwnerInfo.userLogin,
            false
        )

        await this.postsRepository.createPost(createdPost)

        const displayedPost = await this.postsService.transformPostWithDefaultLikesInfo(createdPost)
        return displayedPost
    }
}