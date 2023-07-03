import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { generateErrorsMessages } from "../../../../general/helpers"
import { ForbiddenException } from '@nestjs/common'
import { CommentsTypeORMRepository } from "../../../infrastructure/comments/typeORM/comments-typeORM-repository"

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
    constructor(private readonly commentsRepository: CommentsTypeORMRepository) { }

    async execute(command: UpdateCommentCommand) {
        const commentByCommentId = await this.commentsRepository.getCommentById(command.commentId)
        if (commentByCommentId.commentator.id !== command.userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        commentByCommentId.content = command.content

        await this.commentsRepository.dataSourceSave(commentByCommentId)
    }
}