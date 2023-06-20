import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { ReadPostsQueryParams } from '../../../api/models/ReadPostsQuery'
import { PostsWithQueryOutputModel } from '../../../../Blogger/domain/posts/PostsTypes'
import { PostsQuerySQLRepository } from '../../../../Blogger/infrastructure/posts/posts-query-sql-repository'
import { JwtService } from '../../../../general/adapters/jwt.adapter'

export class GetPostsForBlogCommand implements ICommand {
    constructor(
        public readonly queryParams: ReadPostsQueryParams,
        public readonly blogId: string,
        public readonly authorizationHeader: string,
    ) { }
}

@CommandHandler(GetPostsForBlogCommand)
export class GetPostsForBlogUseCase implements ICommandHandler<GetPostsForBlogCommand> {
    constructor(
        private readonly postsQueryRepository: PostsQuerySQLRepository,
        private readonly jwtService: JwtService,
    ) { }

    async execute(command: GetPostsForBlogCommand): Promise<PostsWithQueryOutputModel> {
        const accessToken = command.authorizationHeader ? command.authorizationHeader.split(' ')[1] : null

        const userId = await this.jwtService.getCorrectUserIdByAccessToken(accessToken)

        return this.postsQueryRepository.findPostsForBlog(command.queryParams, command.blogId, userId)
    }
}
