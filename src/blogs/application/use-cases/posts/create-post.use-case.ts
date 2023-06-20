import { ICommandHandler } from "@nestjs/cqrs"
import { PostInputModel } from "../../../../Blogger/api/models/PostInputModel"
import { PostDTO } from "../../../../Blogger/domain/posts/PostsTypes"
import { PostsViewModel } from "../../dto/PostViewModel"
import { BlogsSQLRepository } from "../../../../Blogger/infrastructure/blogs/blogs-sql-repository"
import { PostsSQLRepository } from "../../../../Blogger/infrastructure/posts/posts-sql-repository"

export class CreatePostCommand {
    constructor(
        public readonly body: PostInputModel,
    ) { }
}

export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
    constructor(
        private readonly blogsRepository: BlogsSQLRepository,
        private readonly postsRepository: PostsSQLRepository,
    ) { }

    async execute(command: CreatePostCommand): Promise<PostsViewModel> {
        const { body } = command

        const blogById = await this.blogsRepository.findBlogById(body.blogId)

        const creatingPost: PostDTO = new PostDTO(
            body.title,
            body.shortDescription,
            body.content,
            blogById.id,
            blogById?.name ? blogById?.name : 'not found',
            blogById.blogOwnerInfo.userId,
            blogById.blogOwnerInfo.userLogin,
            false
        )

        return this.postsRepository.createPost(creatingPost)
    }
}