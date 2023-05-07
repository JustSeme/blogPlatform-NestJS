import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { ReadPostsQueryParams } from '../../../api/models/ReadPostsQuery'
import { PostsRepository } from '../../../infrastructure/posts/posts-db-repository'
import { PostsService } from '../../posts-service'
import { PostsWithQueryOutputModel } from '../../../domain/posts/PostsTypes'

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
        private readonly postsRepository: PostsRepository,
        private readonly postsService: PostsService,
    ) { }

    async execute(command: GetPostsForBlogCommand): Promise<PostsWithQueryOutputModel> {
        const accessToken = command.authorizationHeader ? command.authorizationHeader.split(' ')[1] : null
        const postsWithQueryData = await this.postsRepository.findPosts(command.queryParams, command.blogId)

        const displayedPosts = await this.postsService.transformPostsForDisplay(postsWithQueryData.items, accessToken)
        const postsViewQueryData = {
            ...postsWithQueryData, items: displayedPosts
        }

        return postsViewQueryData
    }
}
