import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/rawSQL/posts-sql-repository"
import { UsersTypeORMRepository } from "../../infrastructure/typeORM/users-typeORM-repository"
import { CommentsTypeORMRepository } from "../../../blogs/infrastructure/typeORM/comments-typeORM-repository"
import { DevicesTypeORMRepository } from "../../../security/infrastructure/typeORM/devices-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

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
        private deviceRepository: DevicesTypeORMRepository,
        private postsRepository: PostsSQLRepository,
        private commentsRepository: CommentsTypeORMRepository,
        @InjectDataSource() private dataSource: DataSource
    ) { }

    async execute(command: BanUserCommand) {
        const {
            banReason,
            userId,
        } = command

        const queryRunner = this.dataSource.createQueryRunner()



        const isBanned = await this.usersRepository.banUserById(userId, banReason)

        const isEntitiesHided = await this.hideUserEntities(userId)
        return isEntitiesHided && isBanned
    }

    async hideUserEntities(userId: string) {
        try {
            const isSessionsDeleted = await this.deviceRepository.deleteAllSessions(userId)

            const isPostsHided = await this.postsRepository.hideAllPostsForCurrentUser(userId)
            const isPostsLikesHided = await this.postsRepository.hideAllLikeEntitiesForPostsByUserId(userId)

            const isCommentsHided = await this.commentsRepository.hideAllCommentsForCurrentUser(userId)
            const isCommentLikesHided = await this.commentsRepository.hideAllLikeEntitiesForCommentsByUserId(userId)

            return isSessionsDeleted && isPostsHided && isPostsLikesHided && isCommentsHided && isCommentLikesHided
        } catch (err) {
            console.error(err)
            return false
        }
    }
}