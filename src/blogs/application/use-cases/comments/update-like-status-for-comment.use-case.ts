import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { LikeType } from "../../../api/models/LikeInputModel"
import { CommentsTypeORMRepository } from "../../../infrastructure/typeORM/comments-typeORM-repository"
import { CommentLikesInfo } from "../../../domain/typeORM/comment-likes-info.entity"
import { UsersTypeORMQueryRepository } from "../../../../SuperAdmin/infrastructure/typeORM/users-typeORM-query-repository"

export class UpdateLikeStatusForCommentCommand {
    constructor(
        public userId: string,
        public commentId: string,
        public status: LikeType
    ) { }
}

@CommandHandler(UpdateLikeStatusForCommentCommand)
export class UpdateLikeStatusForCommentUseCase implements ICommandHandler<UpdateLikeStatusForCommentCommand> {

    constructor(
        private readonly commentsRepository: CommentsTypeORMRepository,
        private readonly usersQueryRepository: UsersTypeORMQueryRepository,
    ) { }

    async execute(command: UpdateLikeStatusForCommentCommand): Promise<boolean> {
        const comment = await this.commentsRepository.getCommentById(command.commentId)
        if (!comment) {
            return false
        }

        const commentator = await this.usersQueryRepository.findUserData(command.userId)

        const likeEntity = await this.commentsRepository.getLikeEntity(command.userId, command.commentId)

        if (likeEntity) {
            likeEntity.likeStatus = command.status

            const savedEntity = await this.commentsRepository.dataSourceSave(likeEntity)

            return savedEntity ? true : false
        } else {
            const likeEntity = new CommentLikesInfo()
            likeEntity.user = commentator
            likeEntity.comment = comment
            likeEntity.createdAt = new Date()
            likeEntity.likeStatus = command.status

            const savedEntity = await this.commentsRepository.dataSourceSave(likeEntity)
            return savedEntity ? true : false
        }
    }
}
