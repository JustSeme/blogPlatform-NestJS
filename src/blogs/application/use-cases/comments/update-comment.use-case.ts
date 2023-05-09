import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentsRepository } from "../../../infrastructure/comments/comments-db-repository"
import { generateErrorsMessages } from "../../../../general/helpers"
import { ForbiddenException } from '@nestjs/common'

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
    constructor(private readonly commentsRepository: CommentsRepository) { }


    async execute(command: UpdateCommentCommand) {
        const commentByCommentId = await this.commentsRepository.getCommentById(command.commentId)
        if (commentByCommentId.commentatorInfo.userId !== command.userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        await this.commentsRepository.updateComment(command.commentId, command.content)
    }
}