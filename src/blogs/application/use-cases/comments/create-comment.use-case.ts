import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentsRepository } from "../../../infrastructure/comments/comments-db-repository"
import { CommentDBModel } from "../../../domain/comments/CommentTypes"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { CommentsService } from "../../comments-service"
import { UsersQueryRepository } from "../../../../SuperAdmin/infrastructure/users-query-repository"

// Command
export class CreateCommentCommand {
    constructor(
        public content: string,
        public commentatorId: string,
        public postId: string,
    ) { }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
    constructor(
        private readonly commentsRepository: CommentsRepository,
        private readonly commentsService: CommentsService,
        private readonly usersQueryRepository: UsersQueryRepository,
    ) { }

    async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
        const commentator = await this.usersQueryRepository.findUserById(command.commentatorId)

        if (!commentator) {
            return null
        }

        const createdComment = new CommentDBModel(command.content, command.postId, command.commentatorId, commentator.login, false)

        await this.commentsRepository.createComment(createdComment)

        return this.commentsService.transformCommentWithDefaultLikeInfo(createdComment)
    }
}
