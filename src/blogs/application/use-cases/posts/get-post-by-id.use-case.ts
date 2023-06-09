import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { PostsService } from "../../posts-service"
import { PostsViewModel } from "../../dto/PostViewModel"
import { NotFoundException } from '@nestjs/common'
import { PostsSQLRepository } from "../../../../Blogger/infrastructure/posts/posts-sql-repository"

export class GetPostByIdCommand {
    constructor(
        public readonly postId: string,
        public readonly authorizationHeader: string,
    ) { }
}


@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
    constructor(
        private readonly postsRepository: PostsSQLRepository,
        private readonly postsService: PostsService,
    ) { }

    async execute(query: GetPostByIdCommand): Promise<PostsViewModel> {
        const accessToken = query.authorizationHeader ? query.authorizationHeader.split(' ')[1] : null

        const findedPost = await this.postsRepository.getPostById(query.postId)

        if (!findedPost) {
            throw new NotFoundException('blog by this post is banned')
        }

        const displayedPost = await this.postsService.transformPostsForDisplay([findedPost], accessToken)

        return displayedPost[0]
    }
}
