import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { DevicesSQLRepository } from "../../../security/infrastructure/devices-sql-repository"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/rawSQL/posts-sql-repository"
import { UsersTypeORMRepository } from "../../infrastructure/typeORM/users-typeORM-repository"
import { CommentsTypeORMRepository } from "../../../blogs/infrastructure/typeORM/comments-typeORM-repository"

export class BanUserCommand {
    constructor(
        public readonly banReason: string,
        public readonly userId: string,
    ) { }
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
    constructor(
        private usersRepository: UsersTypeORMRepository,
        private deviceRepository: DevicesSQLRepository,
        private postsRepository: PostsSQLRepository,
        private commentsRepository: CommentsTypeORMRepository,
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