import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { UsersRepository } from "../../../general/users/infrastructure/users-db-repository"
import { BanInputModel } from "../../api/models/BanInputModel"
import { DeviceRepository } from '../../../security/infrastructure/device-db-repository'
import { PostsRepository } from "../../../blogs/infrastructure/posts/posts-db-repository"
import { CommentsRepository } from "../../../blogs/infrastructure/comments/comments-db-repository"

export class BanUserCommand {
    constructor(
        public readonly banInputModel: BanInputModel,
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
            banInputModel,
            userId,
        } = command

        const userById = await this.usersRepository.findUserById(userId)

        const isBanned = userById.banCurrentUser(banInputModel)
        if (isBanned) {
            await this.usersRepository.save(userById)
        }

        const isSessionsDeleted = await this.deviceRepository.deleteAllSessions(userId)

        const isPostsHided = await this.postsRepository.hideAllPostsForCurrentUser(userId)
        const isPostsLikesHided = await this.postsRepository.hideAllLikeEntitiesForPostsByUserId(userId)

        const isCommentsHided = await this.commentsRepository.hideAllCommentsForCurrentUser(userId)
        const isCommentLikesHided = await this.commentsRepository.hideAllLikeEntitiesForCommentsByUserId(userId)

        const isAllEntitiesForUserHided = isSessionsDeleted && isPostsHided && isPostsLikesHided && isCommentsHided && isCommentLikesHided

        if (isAllEntitiesForUserHided) {
            return true
        }
    }
}