import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadPostsQueryParams } from "../../../api/models/ReadPostsQuery"
import { PostsService } from "../../posts-service"
import { PostsWithQueryOutputModel } from "../../../../Blogger/domain/posts/PostsTypes"
import { PostsQuerySQLRepository } from "../../../../Blogger/infrastructure/posts/posts-query-sql-repository"

export class GetPostsCommand {
    constructor(
        public readonly queryParams: ReadPostsQueryParams,
        public readonly authorizationHeader: string,
    ) { }
}

@CommandHandler(GetPostsCommand)
export class GetPostsUseCase implements ICommandHandler<GetPostsCommand> {
    constructor(
        private readonly postsQueryRepository: PostsQuerySQLRepository,
        private readonly postsService: PostsService,
    ) { }

    async execute(query: GetPostsCommand): Promise<PostsWithQueryOutputModel> {
        const accessToken = query.authorizationHeader ? query.authorizationHeader.split(' ')[1] : null
        const postsWithQueryData = await this.postsQueryRepository.findPosts(query.queryParams, null)

        const displayedPosts = await this.postsService.transformPostsForDisplay(postsWithQueryData.items, accessToken)
        const postsViewQueryData = {
            ...postsWithQueryData, items: displayedPosts
        }

        return postsViewQueryData
    }
}
