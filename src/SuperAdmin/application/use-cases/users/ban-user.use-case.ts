import { CommandHandler } from "@nestjs/cqrs"
import { UsersTypeORMRepository } from "../../../infrastructure/typeORM/users-typeORM-repository"
import { CommentsTypeORMRepository } from "../../../../blogs/infrastructure/typeORM/comments-typeORM-repository"
import { DevicesTypeORMRepository } from "../../../../security/infrastructure/typeORM/devices-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { PostsTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"
import { TransactionBaseUseCase } from "../../../../general/use-cases/transaction-base.use-case"
import { BanUserInputModel } from "../../../api/models/users/BanUserInputModel"

export class UpdateBanUserCommand {
    constructor(
        public readonly banInputModel: BanUserInputModel,
        public readonly userId: string,
    ) { }
}

@CommandHandler(UpdateBanUserCommand)
export class UpdateBanUserUseCase extends TransactionBaseUseCase<UpdateBanUserCommand, boolean> {
    constructor(
        protected usersRepository: UsersTypeORMRepository,
        protected deviceRepository: DevicesTypeORMRepository,
        protected postsRepository: PostsTypeORMRepository,
        protected commentsRepository: CommentsTypeORMRepository,
        @InjectDataSource() protected dataSource: DataSource
    ) {
        super(dataSource)
    }

    async doLogic(input: UpdateBanUserCommand): Promise<boolean> {
        const {
            banInputModel,
            userId,
        } = input

        const isBanned = await this.usersRepository.updateBanForUser(userId, banInputModel)

        const isEntitiesHided = await this.updateIsBannedForUserEntities(userId, input.banInputModel.isBanned)

        if (!isEntitiesHided) {
            throw new Error('Something wrong with hiding all entities, transacion is not completed')
        }

        return isEntitiesHided && isBanned
    }

    async execute(command: UpdateBanUserCommand) {
        return super.execute(command)
    }

    async updateIsBannedForUserEntities(userId: string, isBanned: boolean) {
        try {
            let isSessionsDeleted = true
            if (isBanned) {
                isSessionsDeleted = await this.deviceRepository.deleteAllSessions(userId)
            }

            const isPostsHided = await this.postsRepository.updateIsBannedByUserId(userId, isBanned)
            const isPostsLikesHided = await this.postsRepository.updateIsBannedForLikeEntitiesForPostsByUserId(userId, isBanned)

            const isCommentsHided = await this.commentsRepository.updateIsBannedCommentsByUserId(userId, isBanned)
            const isCommentLikesHided = await this.commentsRepository.updateIsBannedLikeEntitiesForCommentsByUserId(userId, isBanned)

            return isSessionsDeleted && isPostsHided && isPostsLikesHided && isCommentsHided && isCommentLikesHided
        } catch (err) {
            console.error(err)
            return false
        }
    }
}