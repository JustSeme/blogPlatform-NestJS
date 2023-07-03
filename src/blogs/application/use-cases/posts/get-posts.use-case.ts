import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadPostsQueryParams } from "../../../api/models/ReadPostsQuery"
import { PostsWithQueryOutputModel } from "../../../../Blogger/domain/posts/PostsTypes"
import { PostsQuerySQLRepository } from "../../../../Blogger/infrastructure/posts/rawSQL/posts-query-sql-repository"
import { JwtService } from "../../../../general/adapters/jwt.adapter"

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
        private readonly jwtService: JwtService,
    ) { }

    async execute(query: GetPostsCommand): Promise<PostsWithQueryOutputModel> {
        const accessToken = query.authorizationHeader ? query.authorizationHeader.split(' ')[1] : null

        const userId = await this.jwtService.getCorrectUserIdByAccessToken(accessToken)

        return this.postsQueryRepository.findPosts(query.queryParams, userId)
    }
}
