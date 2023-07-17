import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { UsersTypeORMRepository } from "../../../infrastructure/typeORM/users-typeORM-repository"
import { CommentsTypeORMRepository } from "../../../../blogs/infrastructure/typeORM/comments-typeORM-repository"
import { DevicesTypeORMRepository } from "../../../../security/infrastructure/typeORM/devices-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { PostsTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"

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
        private postsRepository: PostsTypeORMRepository,
        private commentsRepository: CommentsTypeORMRepository,
        @InjectDataSource() private dataSource: DataSource
    ) { }

    async execute(command: BanUserCommand) {
        const {
            banReason,
            userId,
        } = command

        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        try {
            const isBanned = await this.usersRepository.banUserById(userId, banReason)

            const isEntitiesHided = await this.hideUserEntities(userId)

            if (!isEntitiesHided) {
                throw new Error('Something wrong with hiding all entities, transacion is not completed')
            }

            await queryRunner.commitTransaction()

            return isEntitiesHided && isBanned
        } catch (err) {
            console.error(err)
            await queryRunner.rollbackTransaction()
            return false
        } finally {
            await queryRunner.release()
        }
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