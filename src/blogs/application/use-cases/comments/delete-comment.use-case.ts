import {
    CommandHandler, ICommandHandler
} from '@nestjs/cqrs'
import { CommentsRepository } from '../../../infrastructure/comments/comments-db-repository'
import { ForbiddenException } from '@nestjs/common'
import { generateErrorsMessages } from '../../../../general/helpers'

// Command
export class DeleteCommentCommand {
    constructor(public commentId: string, public userId: string) { }
}

// CommandHandler
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
    constructor(private readonly commentsRepository: CommentsRepository) { }

    async execute(command: DeleteCommentCommand): Promise<boolean> {
        const commentByCommentId = await this.commentsRepository.getCommentById(command.commentId)

        if (commentByCommentId.commentatorInfo.userId !== command.userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        const deletedComment = await this.commentsRepository.deleteComment(command.commentId)
        return deletedComment // cast to boolean
    }
}
