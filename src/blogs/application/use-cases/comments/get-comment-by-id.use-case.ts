import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { NotFoundException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { JwtService } from "../../../../general/adapters/jwt.adapter"
import { CommentsQueryTypeORMRepository } from "../../../infrastructure/typeORM/comments-query-typeORM-repository"

export class GetCommentByIdCommand {
    constructor(
        public readonly commentId: string,
        public readonly authorizationHeader: string,
    ) { }
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase implements ICommandHandler<GetCommentByIdCommand> {
    constructor(
        private readonly commentsQueryRepository: CommentsQueryTypeORMRepository,
        private readonly jwtService: JwtService,
    ) { }


    async execute(command: GetCommentByIdCommand): Promise<CommentViewModel> {
        const accessToken = command.authorizationHeader ? command.authorizationHeader.split(' ')[1] : null

        const userId = await this.jwtService.getCorrectUserIdByAccessToken(accessToken)

        const findedComment = await this.commentsQueryRepository.getCommentByIdWithLikesInfo(command.commentId, userId)

        if (!findedComment) {
            throw new NotFoundException(generateErrorsMessages('Creator of this comment is banned', 'commentId'))
        }

        return findedComment
    }
}