import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanUserInputModel } from "../../api/models/BanUserInputModel"
import { DeviceRepository } from '../../../security/infrastructure/device-db-repository'
import { PostsRepository } from "../../../Blogger/infrastructure/posts/posts-db-repository"
import { CommentsRepository } from "../../../blogs/infrastructure/comments/comments-db-repository"
import { UsersRepository } from "../../infrastructure/users-db-repository"

export class BanUserCommand {
    constructor(
        public readonly BanUserInputModel: BanUserInputModel,
        public readonly userId: string,
    ) { }
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
    constructor(
        private usersRepository: UsersRepository,
        private deviceRepository: DeviceRepository,
        private postsRepository: PostsRepository,
        private commentsRepository: CommentsRepository,
    ) { }

    async execute(command: BanUserCommand) {
        const {
            BanUserInputModel,
            userId,
        } = command

        const userById = await this.usersRepository.findUserById(userId)

        const isBanned = userById.banCurrentUser(BanUserInputModel)
        if (isBanned) {
            await this.usersRepository.save(userById)
        }

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