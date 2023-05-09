import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { PostDBModel } from "../../../domain/posts/PostsTypes"
import { PostsRepository } from "../../../infrastructure/posts/posts-db-repository"
import { PostsService } from "../../../../blogs/application/posts-service"
import { PostsViewModel } from "../../../../blogs/application/dto/PostViewModel"
import { BlogsRepository } from "../../../infrastructure/blogs/blogs-db-repository"
import { ForbiddenException } from '@nestjs/common'
import { PostInputModelWithoutBlogId } from "../../../api/models/PostInputModelWithoutBlogId"

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
        private readonly blogsRepository: BlogsRepository,
        private readonly postsRepository: PostsRepository,
        private readonly postsService: PostsService,
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

        const createdPost = new PostDBModel(
            postInputModel.title,
            postInputModel.shortDescription,
            postInputModel.content,
            blogId,
            blogById.name,
            blogById.blogOwnerInfo.userId,
            blogById.blogOwnerInfo.userLogin,
            false
        )

        await this.postsRepository.createPost(createdPost)

        const displayedPost = this.postsService.transformPostWithDefaultLikesInfo(createdPost)
        return displayedPost
    }
}
