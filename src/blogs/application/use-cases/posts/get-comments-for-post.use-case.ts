import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadCommentsQueryParams } from "../../../api/models/ReadCommentsQuery"
import { CommentsRepository } from "../../../infrastructure/comments/comments-db-repository"
import { CommentsService } from "../../comments-service"
import { CommentsWithQueryOutputModel } from "../../dto/CommentViewModel"

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
        private commentsRepository: CommentsRepository,
        private commentsService: CommentsService,
    ) { }


    async execute(command: GetCommentsForPostCommand): Promise<CommentsWithQueryOutputModel> {
        const {
            postId,
            queryParams,
            authorizationHeader
        } = command

        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null
        const findedCommentsQueryData = await this.commentsRepository.getComments(queryParams, postId)

        const displayedComments = await this.commentsService.transformCommentsForDisplay(findedCommentsQueryData.items, accessToken)

        findedCommentsQueryData.items = displayedComments
        return findedCommentsQueryData
    }
}