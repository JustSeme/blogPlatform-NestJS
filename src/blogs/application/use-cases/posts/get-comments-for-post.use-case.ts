import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadCommentsQueryParams } from "../../../api/models/ReadCommentsQuery"
import { CommentsService } from "../../comments-service"
import { CommentsWithQueryOutputModel } from "../../dto/CommentViewModel"
import { CommentsQuerySQLRepository } from "../../../infrastructure/comments/comments-query-sql-repository"

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
        private commentsService: CommentsService,
    ) { }


    async execute(command: GetCommentsForPostCommand): Promise<CommentsWithQueryOutputModel> {
        const {
            postId,
            queryParams,
            authorizationHeader
        } = command

        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null
        const findedCommentsQueryData = await this.commentsQueryRepository.getCommentsForPost(queryParams, postId)

        const displayedComments = await this.commentsService.transformCommentsForDisplay(findedCommentsQueryData.items, accessToken)

        findedCommentsQueryData.items = displayedComments
        return findedCommentsQueryData
    }
}