import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { PostDTO } from "../../../domain/posts/PostsTypes"
import { PostsViewModel } from "../../../../blogs/application/dto/PostViewModel"
import { ForbiddenException } from '@nestjs/common'
import { PostInputModelWithoutBlogId } from "../../../api/models/PostInputModelWithoutBlogId"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/blogs-sql-repository"
import { PostsSQLRepository } from "../../../infrastructure/posts/posts-sql-repository"

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
        private readonly blogsRepository: BlogsSQLRepository,
        private readonly postsRepository: PostsSQLRepository,
    ) { }

    async execute(command: CreatePostForBloggerCommand): Promise<PostsViewModel> {
        const {
            postInputModel,
            blogId,
            creatorId
        } = command

        const blogById = await this.blogsRepository.findBlogById(blogId)

        if (blogById.blogOwnerInfo.userId !== creatorId) {
            throw new ForbiddenException('that is not your own')
        }

        const createdPost = new PostDTO(
            postInputModel.title,
            postInputModel.shortDescription,
            postInputModel.content,
            blogId,
            blogById.name,
            blogById.blogOwnerInfo.userId,
            blogById.blogOwnerInfo.userLogin,
            false
        )

        return this.postsRepository.createPost(createdPost)
    }
}
