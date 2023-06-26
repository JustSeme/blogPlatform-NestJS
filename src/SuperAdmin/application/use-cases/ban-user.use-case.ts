import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { DevicesSQLRepository } from "../../../security/infrastructure/devices-sql-repository"
import { UsersSQLRepository } from "../../infrastructure/rawSQL/users-sql-repository"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/posts-sql-repository"
import { CommentsSQLRepository } from "../../../blogs/infrastructure/comments/comments-sql-repository"

export class BanUserCommand {
    constructor(
        public readonly banReason: string,
        public readonly userId: string,
    ) { }
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
    constructor(
        private usersRepository: UsersSQLRepository,
        private deviceRepository: DevicesSQLRepository,
        private postsRepository: PostsSQLRepository,
        private commentsRepository: CommentsSQLRepository,
    ) { }

    async execute(command: BanUserCommand) {
        const {
            banReason,
            userId,
        } = command

        const isBanned = await this.usersRepository.banUserById(userId, banReason)

        const isEntitiesHided = await this.hideUserEntities(userId)
        return isEntitiesHided && isBanned
    }

    async hideUserEntities(userId: string) {
        const isSessionsDeleted = await this.deviceRepository.deleteAllSessions(userId)

        const isPostsHided = await this.postsRepository.hideAllPostsForCurrentUser(userId)
        const isPostsLikesHided = await this.postsRepository.hideAllLikeEntitiesForPostsByUserId(userId)

        const isCommentsHided = await this.commentsRepository.hideAllCommentsForCurrentUser(userId)
        const isCommentLikesHided = await this.commentsRepository.hideAllLikeEntitiesForCommentsByUserId(userId)

        const isAllEntitiesForUserHided = isSessionsDeleted && isPostsHided && isPostsLikesHided && isCommentsHided && isCommentLikesHided

        return isAllEntitiesForUserHided
    }
}