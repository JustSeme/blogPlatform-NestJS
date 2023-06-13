import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { ReadPostsQueryParams } from '../../../api/models/ReadPostsQuery'
import { PostsService } from '../../posts-service'
import { PostsWithQueryOutputModel } from '../../../../Blogger/domain/posts/PostsTypes'
import { PostsQuerySQLRepository } from '../../../../Blogger/infrastructure/posts/posts-query-sql-repository'

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
        private readonly postsService: PostsService,
    ) { }

    async execute(command: GetPostsForBlogCommand): Promise<PostsWithQueryOutputModel> {
        const accessToken = command.authorizationHeader ? command.authorizationHeader.split(' ')[1] : null
        const postsWithQueryData = await this.postsQueryRepository.findPosts(command.queryParams, command.blogId)

        /* const displayedPosts = await this.postsService.transformPostsForDisplay(postsWithQueryData.items, accessToken)
        const postsViewQueryData = {
            ...postsWithQueryData, items: displayedPosts
        } */

        return postsWithQueryData
    }
}
