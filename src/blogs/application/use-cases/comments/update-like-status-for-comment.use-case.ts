import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { LikeType } from "../../../api/models/LikeInputModel"
import { CommentsSQLRepository } from "../../../infrastructure/comments/comments-sql-repository"

export class UpdateLikeStatusForCommentCommand {
    constructor(
        public userId: string,
        public commentId: string,
        public status: LikeType
    ) { }
}

@CommandHandler(UpdateLikeStatusForCommentCommand)
export class UpdateLikeStatusForCommentUseCase implements ICommandHandler<UpdateLikeStatusForCommentCommand> {

    constructor(private readonly commentsRepository: CommentsSQLRepository) { }

    async execute(command: UpdateLikeStatusForCommentCommand): Promise<boolean> {
        const isCommentExists = await this.commentsRepository.isCommentExists(command.commentId)
        if (!isCommentExists) {
            return false
        }

        const isLikeEntityExists = await this.commentsRepository.isLikeEntityExists(command.userId, command.commentId)

        if (isLikeEntityExists) {
            return this.commentsRepository.updateLikeStatus(command.userId, command.commentId, command.status)
        } else {
            if (command.status === 'Like') {
                return this.commentsRepository.createLike(command.userId, command.commentId)
            }

            if (command.status === 'Dislike') {
                return this.commentsRepository.createDislike(command.userId, command.commentId)
            }
        }
        return true
    }
}
