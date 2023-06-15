import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentsService } from "../../comments-service"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { NotFoundException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { CommentsSQLRepository } from "../../../infrastructure/comments/comments-sql-repository"

export class GetCommentByIdCommand {
    constructor(
        public readonly commentId: string,
        public readonly authorizationHeader: string,
    ) { }
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase implements ICommandHandler<GetCommentByIdCommand> {
    constructor(
        private readonly commentsRepository: CommentsSQLRepository,
        private readonly commentsService: CommentsService,
    ) { }


    async execute(query: GetCommentByIdCommand): Promise<CommentViewModel> {
        const accessToken = query.authorizationHeader ? query.authorizationHeader.split(' ')[1] : null
        const findedComment = await this.commentsRepository.getCommentById(query.commentId)

        if (!findedComment) {
            throw new NotFoundException(generateErrorsMessages('Creator of this comment is banned', 'commentId'))
        }

        return findedComment
    }
}