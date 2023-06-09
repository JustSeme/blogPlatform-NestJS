import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentsRepository } from "../../../blogs/infrastructure/comments/comments-db-repository"
import { UsersSQLRepository } from "../../infrastructure/users-sql-repository"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/posts-sql-repository"

export class UnbanUserCommand {
    constructor(
        public readonly userId: string,
    ) { }
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
    constructor(
        private usersRepository: UsersSQLRepository,
        private postsRepository: PostsSQLRepository,
        private commentsRepository: CommentsRepository,
    ) { }

    async execute(command: UnbanUserCommand) {
        const { userId } = command

        await this.usersRepository.unbanUserById(userId)

        return this.unHideUserEnitties(userId)
    }

    async unHideUserEnitties(userId: string) {
        const isPostsHided = await this.postsRepository.hideAllPostsForCurrentUser(userId)
        const isPostsLikesHided = await this.postsRepository.unHideAllLikeEntitiesForPostsByUserId(userId)

        const isCommentsHided = await this.commentsRepository.unHideAllCommentsForCurrentUser(userId)
        const isCommentLikesHided = await this.commentsRepository.unHideAllLikeEntitiesForCommentsByUserId(userId)

        const isAllEntitiesForUserHided = isPostsHided && isPostsLikesHided && isCommentsHided && isCommentLikesHided

        return isAllEntitiesForUserHided
    }
}