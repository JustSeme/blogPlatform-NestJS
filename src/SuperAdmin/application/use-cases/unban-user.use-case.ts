import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/rawSQL/posts-sql-repository"
import { CommentsSQLRepository } from "../../../blogs/infrastructure/comments/rawSQL/comments-sql-repository"
import { UsersTypeORMRepository } from "../../infrastructure/typeORM/users-typeORM-repository"

export class UnbanUserCommand {
    constructor(
        public readonly userId: string,
    ) { }
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
    constructor(
        private usersRepository: UsersTypeORMRepository,
        private postsRepository: PostsSQLRepository,
        private commentsRepository: CommentsSQLRepository,
    ) { }

    async execute(command: UnbanUserCommand) {
        const { userId } = command

        const isUserUnbanned = await this.usersRepository.unbanUserById(userId)

        const isAllEntitiesUnhided = await this.unHideUserEnitties(userId)

        return isUserUnbanned && isAllEntitiesUnhided
    }

    async unHideUserEnitties(userId: string) {
        const isPostsUnhided = await this.postsRepository.unhideAllPostsForCurrentUser(userId)
        const isPostsLikesUnhided = await this.postsRepository.unHideAllLikeEntitiesForPostsByUserId(userId)

        const isCommentsUnhided = await this.commentsRepository.unHideAllCommentsForCurrentUser(userId)
        const isCommentLikesUnhided = await this.commentsRepository.unHideAllLikeEntitiesForCommentsByUserId(userId)

        const isAllEntitiesForUserHided = isPostsUnhided && isPostsLikesUnhided && isCommentsUnhided && isCommentLikesUnhided

        return isAllEntitiesForUserHided
    }
}