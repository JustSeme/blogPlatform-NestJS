import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { PostsRepository } from "../../../infrastructure/posts/posts-db-repository"
import { PostsService } from "../../posts-service"
import { PostsViewModel } from "../../dto/PostViewModel"

export class GetPostByIdCommand {
    constructor(
        public readonly postId: string,
        public readonly authorizationHeader: string,
    ) { }
}


@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly postsService: PostsService,
    ) { }

    async execute(query: GetPostByIdCommand): Promise<PostsViewModel> {
        const accessToken = query.authorizationHeader ? query.authorizationHeader.split(' ')[1] : null

        const findedPost = await this.postsRepository.getPostById(query.postId)

        const displayedPost = await this.postsService.transformPostsForDisplay([findedPost], accessToken)

        return displayedPost[0]
    }
}
