import { ICommandHandler } from "@nestjs/cqrs"
import { PostInputModel } from "../../../api/models/PostInputModel"
import { BlogsRepository } from "../../../infrastructure/blogs/blogs-db-repository"
import { PostsRepository } from "../../../infrastructure/posts/posts-db-repository"
import { PostsService } from "../../posts-service"
import { PostDBModel } from "../../../domain/posts/PostsTypes"
import { PostsViewModel } from "../../dto/PostViewModel"

export class CreatePostCommand {
    constructor(public readonly body: PostInputModel) { }
}

export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
    constructor(
        private readonly blogsRepository: BlogsRepository,
        private readonly postsRepository: PostsRepository,
        private readonly postsService: PostsService,
    ) { }

    async execute(command: CreatePostCommand): Promise<PostsViewModel> {
        const { body } = command

        const blogById = await this.blogsRepository.findBlogById(body.blogId)

        const createdPost: PostDBModel = new PostDBModel(
            body.title,
            body.shortDescription,
            body.content,
            blogById.id,
            blogById?.name ? blogById?.name : 'not found',
        )

        await this.postsRepository.createPost(createdPost)

        const displayedPost = await this.postsService.transformCommentsForDisplay([createdPost], null)
        return displayedPost[0]
    }
}