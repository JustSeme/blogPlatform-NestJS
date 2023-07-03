import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadCommentsQueryParams } from "../../../api/models/ReadCommentsQuery"
import { CommentsWithQueryOutputModel } from "../../dto/CommentViewModel"
import { CommentsQuerySQLRepository } from "../../../infrastructure/comments/rawSQL/comments-query-sql-repository"
import { JwtService } from "../../../../general/adapters/jwt.adapter"

export class GetCommentsForPostCommand {
    constructor(
        public readonly postId: string,
        public readonly queryParams: ReadCommentsQueryParams,
        public readonly authorizationHeader: string,
    ) { }
}

@CommandHandler(GetCommentsForPostCommand)
export class GetCommentsForPostUseCase implements ICommandHandler<GetCommentsForPostCommand> {
    constructor(
        private commentsQueryRepository: CommentsQuerySQLRepository,
        private jwtService: JwtService,
    ) { }


    async execute(command: GetCommentsForPostCommand): Promise<CommentsWithQueryOutputModel> {
        const {
            postId,
            queryParams,
            authorizationHeader
        } = command

        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null

        const userId = await this.jwtService.getCorrectUserIdByAccessToken(accessToken)

        return this.commentsQueryRepository.getCommentsForPost(queryParams, postId, userId)
    }
}