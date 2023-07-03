import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { generateErrorsMessages } from "../../../../general/helpers"
import { ForbiddenException } from '@nestjs/common'
import { CommentsSQLRepository } from "../../../infrastructure/comments/rawSQL/comments-sql-repository"

// command
export class UpdateCommentCommand {
    constructor(
        public commentId: string,
        public content: string,
        public userId: string,
    ) { }
}

// handler
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
    constructor(private readonly commentsRepository: CommentsSQLRepository) { }

    async execute(command: UpdateCommentCommand) {
        const commentByCommentId = await this.commentsRepository.getCommentByIdWithLikesInfo(command.commentId, command.userId)
        if (commentByCommentId.commentatorInfo.userId !== command.userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        await this.commentsRepository.updateComment(command.commentId, command.content)
    }
}