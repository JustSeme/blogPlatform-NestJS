import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadPostsQueryParams } from "../../../api/models/ReadPostsQuery"
import { PostsRepository } from "../../../infrastructure/posts/posts-db-repository"
import { PostsService } from "../../posts-service"
import { PostsWithQueryOutputModel } from "../../../domain/posts/PostsTypes"

export class GetPostsCommand {
    constructor(
        public readonly queryParams: ReadPostsQueryParams,
        public readonly authorizationHeader: string,
    ) { }
}

@CommandHandler(GetPostsCommand)
export class GetPostsUseCase implements ICommandHandler<GetPostsCommand> {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly postsService: PostsService,
    ) { }

    async execute(query: GetPostsCommand): Promise<PostsWithQueryOutputModel> {
        const accessToken = query.authorizationHeader ? query.authorizationHeader.split(' ')[1] : null
        const postsWithQueryData = await this.postsRepository.findPosts(query.queryParams, null)

        const displayedPosts = await this.postsService.transformPostsForDisplay(postsWithQueryData.items, accessToken)
        const postsViewQueryData = {
            ...postsWithQueryData, items: displayedPosts
        }

        return postsViewQueryData
    }
}
