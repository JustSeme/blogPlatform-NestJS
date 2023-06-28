import { ICommandHandler } from "@nestjs/cqrs"
import { PostInputModel } from "../../../../Blogger/api/models/PostInputModel"
import { PostDTO } from "../../../../Blogger/domain/posts/PostsTypes"
import { PostsViewModel } from "../../dto/PostViewModel"
import { PostsSQLRepository } from "../../../../Blogger/infrastructure/posts/posts-sql-repository"
import { BlogsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"

export class CreatePostCommand {
    constructor(
        public readonly body: PostInputModel,
    ) { }
}

export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
    constructor(
        private readonly blogsQueryRepository: BlogsQueryTypeORMRepository,
        private readonly postsRepository: PostsSQLRepository,
    ) { }

    async execute(command: CreatePostCommand): Promise<PostsViewModel> {
        const { body } = command

        const blogById = await this.blogsQueryRepository.findBlogById(body.blogId)

        const creatingPost: PostDTO = new PostDTO(
            body.title,
            body.shortDescription,
            body.content,
            blogById.id,
            blogById?.name ? blogById?.name : 'not found',
            blogById.user.id,
            blogById.ownerLogin,
            false
        )

        return this.postsRepository.createPost(creatingPost)
    }
}