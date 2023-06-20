import {
    CommandHandler, ICommandHandler
} from '@nestjs/cqrs'
import { ForbiddenException } from '@nestjs/common'
import { generateErrorsMessages } from '../../../../general/helpers'
import { CommentsSQLRepository } from '../../../infrastructure/comments/comments-sql-repository'

// Command
export class DeleteCommentCommand {
    constructor(public commentId: string, public userId: string) { }
}

// CommandHandler
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
    constructor(private readonly commentsRepository: CommentsSQLRepository) { }

    async execute(command: DeleteCommentCommand): Promise<boolean> {
        const commentByCommentId = await this.commentsRepository.getCommentById(command.commentId)

        if (commentByCommentId.commentatorInfo.userId !== command.userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        return this.commentsRepository.deleteComment(command.commentId)
    }
}
