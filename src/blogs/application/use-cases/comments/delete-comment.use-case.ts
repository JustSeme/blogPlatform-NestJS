import {
    CommandHandler, ICommandHandler
} from '@nestjs/cqrs'
import { ForbiddenException } from '@nestjs/common'
import { generateErrorsMessages } from '../../../../general/helpers'
import { CommentsTypeORMRepository } from '../../../infrastructure/comments/typeORM/comments-typeORM-repository'

// Command
export class DeleteCommentCommand {
    constructor(public commentId: string, public userId: string) { }
}

// CommandHandler
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
    constructor(private readonly commentsRepository: CommentsTypeORMRepository) { }

    async execute(command: DeleteCommentCommand): Promise<boolean> {
        const commentByCommentId = await this.commentsRepository.getCommentById(command.commentId)

        if (commentByCommentId.commentator.id !== command.userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        const isCommentLikesDeleted = await this.commentsRepository.deleteCommentLikesInfo(command.commentId)

        const isCommentDeleted = await this.commentsRepository.deleteComment(command.commentId)

        return isCommentLikesDeleted && isCommentDeleted
    }
}
