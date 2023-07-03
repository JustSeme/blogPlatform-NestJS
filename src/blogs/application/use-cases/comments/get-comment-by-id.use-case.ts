import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { NotFoundException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { CommentsSQLRepository } from "../../../infrastructure/comments/rawSQL/comments-sql-repository"
import { JwtService } from "../../../../general/adapters/jwt.adapter"

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
        private readonly jwtService: JwtService,
    ) { }


    async execute(command: GetCommentByIdCommand): Promise<CommentViewModel> {
        const accessToken = command.authorizationHeader ? command.authorizationHeader.split(' ')[1] : null

        const userId = await this.jwtService.getCorrectUserIdByAccessToken(accessToken)

        const findedComment = await this.commentsRepository.getCommentByIdWithLikesInfo(command.commentId, userId)

        if (!findedComment) {
            throw new NotFoundException(generateErrorsMessages('Creator of this comment is banned', 'commentId'))
        }

        return findedComment
    }
}