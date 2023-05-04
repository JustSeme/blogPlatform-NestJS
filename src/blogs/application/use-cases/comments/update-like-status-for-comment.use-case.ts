import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentsRepository } from "../../../infrastructure/comments/comments-db-repository"
import { LikeType } from "../../../api/models/LikeInputModel"
import { LikeObjectType } from "../../../domain/comments/CommentTypes"

export class UpdateLikeStatusForCommentCommand {
    constructor(
        public userId: string,
        public commentId: string,
        public status: LikeType
    ) { }
}

@CommandHandler(UpdateLikeStatusForCommentCommand)
export class UpdateLikeStatusForCommentUseCase implements ICommandHandler<UpdateLikeStatusForCommentCommand> {
    constructor(private readonly commentsRepository: CommentsRepository) { }
    async execute(command: UpdateLikeStatusForCommentCommand): Promise<boolean> {
        const updatingComment = await this.commentsRepository.getCommentById(command.commentId)
        if (!updatingComment) {
            return false
        }
        const likeData: LikeObjectType = {
            userId: command.userId,
            createdAt: new Date().toISOString(),
            isBanned: false,
        }

        const isNoneSetted = await this.commentsRepository.setNoneLike(command.userId, command.commentId)

        if (command.status === 'Like') {
            return this.commentsRepository.setLike(likeData, command.commentId)
        }

        if (command.status === 'Dislike') {
            return this.commentsRepository.setDislike(likeData, command.commentId)
        }
        return isNoneSetted
    }
}
