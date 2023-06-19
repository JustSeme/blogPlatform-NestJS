import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { NotFoundException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { CommentsSQLRepository } from "../../../infrastructure/comments/comments-sql-repository"
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


    async execute(query: GetCommentByIdCommand): Promise<CommentViewModel> {
        const accessToken = query.authorizationHeader ? query.authorizationHeader.split(' ')[1] : null

        const userId = await this.getCorrectUserIdByAccessToken(accessToken)

        const findedComment = await this.commentsRepository.getCommentByIdWithLikesInfo(query.commentId, userId)

        if (!findedComment) {
            throw new NotFoundException(generateErrorsMessages('Creator of this comment is banned', 'commentId'))
        }

        return findedComment
    }

    async getCorrectUserIdByAccessToken(accessToken: string | null): Promise<string | null> {
        if (accessToken) {
            const jwtResult = await this.jwtService.verifyAccessToken(accessToken)
            return jwtResult ? jwtResult.userId : null
        }
    }
}