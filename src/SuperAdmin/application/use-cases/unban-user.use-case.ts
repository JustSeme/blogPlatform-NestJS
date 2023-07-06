import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/rawSQL/posts-sql-repository"
import { UsersTypeORMRepository } from "../../infrastructure/typeORM/users-typeORM-repository"
import { CommentsTypeORMRepository } from "../../../blogs/infrastructure/typeORM/comments-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

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
        private commentsRepository: CommentsTypeORMRepository,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async execute(command: UnbanUserCommand) {
        const { userId } = command

        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        try {
            const isUserUnbanned = await this.usersRepository.unbanUserById(userId)

            const isAllEntitiesUnhided = await this.unHideUserEnitties(userId)

            if (!isAllEntitiesUnhided) {
                throw new Error('Something wrong with unhiding user entities, transaction in not completed.')
            }

            await queryRunner.commitTransaction()
            return isAllEntitiesUnhided && isUserUnbanned
        } catch (err) {
            console.error(err)
            await queryRunner.rollbackTransaction()
            return false
        } finally {
            await queryRunner.release()
        }
    }

    async unHideUserEnitties(userId: string) {
        try {
            const isPostsUnhided = await this.postsRepository.unhideAllPostsForCurrentUser(userId)
            const isPostsLikesUnhided = await this.postsRepository.unHideAllLikeEntitiesForPostsByUserId(userId)

            const isCommentsUnhided = await this.commentsRepository.unhideAllCommentsForCurrentUser(userId)
            const isCommentLikesUnhided = await this.commentsRepository.unhideAllLikeEntitiesForCommentsByUserId(userId)

            return isPostsUnhided && isPostsLikesUnhided && isCommentsUnhided && isCommentLikesUnhided
        } catch (err) {
            console.error(err)
            return false
        }
    }
}