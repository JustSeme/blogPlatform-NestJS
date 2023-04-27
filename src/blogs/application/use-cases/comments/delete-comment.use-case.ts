import {
    CommandHandler, ICommandHandler
} from '@nestjs/cqrs'
import { CommentsRepository } from '../../../infrastructure/comments/comments-db-repository'

// Command
export class DeleteCommentCommand {
    constructor(public commentId: string) { }
}

// CommandHandler
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
    constructor(private readonly commentsRepository: CommentsRepository) { }

    async execute(command: DeleteCommentCommand): Promise<boolean> {
        const deletedComment = await this.commentsRepository.deleteComment(command.commentId)
        return deletedComment // cast to boolean
    }
}
