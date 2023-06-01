import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { PostsRepository } from "../../../Blogger/infrastructure/posts/posts-db-repository"
import { CommentsRepository } from "../../../blogs/infrastructure/comments/comments-db-repository"
import { DevicesSQLRepository } from "../../../security/infrastructure/devices-sql-repository"
import { UsersSQLRepository } from "../../infrastructure/users-sql-repository"

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
        private postsRepository: PostsRepository,
        private commentsRepository: CommentsRepository,
    ) { }

    async execute(command: BanUserCommand) {
        const {
            banReason,
            userId,
        } = command

        await this.usersRepository.banUserById(userId, banReason)

        return this.hideUserEntities(userId)
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