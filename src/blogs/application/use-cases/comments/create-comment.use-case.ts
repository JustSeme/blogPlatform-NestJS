import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentsRepository } from "../../../infrastructure/comments/comments-db-repository"
import { CommentDBModel } from "../../../domain/comments/CommentTypes"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { CommentsService } from "../../comments-service"
import { UserDTO } from "../../../../SuperAdmin/domain/UsersTypes"

// Command
export class CreateCommentCommand {
    constructor(
        public content: string,
        public commentator: UserDTO | null,
        public postId: string,
    ) { }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
    constructor(
        private readonly commentsRepository: CommentsRepository,
        private readonly commentsService: CommentsService,
    ) { }

    async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
        if (!command.commentator) {
            return null
        }

        const createdComment = new CommentDBModel(command.content, command.postId, command.commentator.id, command.commentator.login, false)

        await this.commentsRepository.createComment(createdComment)

        return this.commentsService.transformCommentWithDefaultLikeInfo(createdComment)
    }
}
