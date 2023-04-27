import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentsRepository } from "../../../infrastructure/comments/comments-db-repository"

// command
export class UpdateCommentCommand {
    constructor(
        public commentId: string,
        public content: string
    ) { }
}

// handler
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
    constructor(private readonly commentsRepository: CommentsRepository) { }


    async execute(command: UpdateCommentCommand) {
        await this.commentsRepository.updateComment(command.commentId, command.content)
    }
}