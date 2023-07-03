import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { NotFoundException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { JwtService } from "../../../../general/adapters/jwt.adapter"
import { CommentsTypeORMRepository } from "../../../infrastructure/comments/typeORM/comments-typeORM-repository"

export class GetCommentByIdCommand {
    constructor(
        public readonly commentId: string,
        public readonly authorizationHeader: string,
    ) { }
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase implements ICommandHandler<GetCommentByIdCommand> {
    constructor(
        private readonly commentsRepository: CommentsTypeORMRepository,
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