import {
    Body,
    Controller, Delete, ForbiddenException, Get, Headers, HttpCode, HttpStatus, NotFoundException, NotImplementedException, Param, Put, UseGuards
} from "@nestjs/common"
import { CommentsService } from "../application/comments-service"
import { CommentInputModel } from "./models/CommentInputModel"
import { CommentViewModel } from "../application/dto/CommentViewModel"
import { LikeInputModel } from "./models/LikeInputModel"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { IsCommentExistsPipe } from "./pipes/isCommentExists.validation.pipe"
import { generateErrorsMessages } from "../../general/helpers"
import { CommandBus } from "@nestjs/cqrs"
import { DeleteCommentCommand } from "../application/use-cases/comments/delete-comment.use-case"
import { UpdateCommentCommand } from "../application/use-cases/comments/update-comment.use-case"
import { UpdateLikeStatusForCommentCommand } from "../application/use-cases/comments/update-like-status-for-comment.use-case"
import { CommentsQueryRepository } from "../infrastructure/comments/comments-query-repository"

@Controller('comments')
export class CommentsController {
    constructor(
        protected commentsService: CommentsService,
        protected commentsQueryRepository: CommentsQueryRepository,
        protected commandBus: CommandBus,
    ) { }

    @Get(':commentId')
    async getComment(@Param('commentId', IsCommentExistsPipe) commentId: string,
        @Headers('Authorization') authorizationHeader: string,): Promise<CommentViewModel> {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null

        const findedComment = await this.commentsQueryRepository.findCommentById(commentId)
        if (!findedComment) {
            throw new NotFoundException(generateErrorsMessages('Comment by commentId paramether is not found', 'commentId'))
        }

        const displayedComment = this.commentsService.transformCommentsForDisplay([findedComment], accessToken)

        return displayedComment[0]
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteComment(@Param('commentId', IsCommentExistsPipe) commentId: string, @CurrentUserId() userId: string): Promise<void> {
        const commentByCommentId = await this.commentsQueryRepository.findCommentById(commentId)
        if (commentByCommentId.commentatorInfo.userId !== userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        const isDeleted = await this.commandBus.execute(
            new DeleteCommentCommand(commentId)
        )
        if (!isDeleted) {
            throw new NotFoundException(generateErrorsMessages('Comment by commentId paramether is not found', 'commentId'))
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put(':commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateComment(
        @Param('commentId', IsCommentExistsPipe) commentId: string,
        @Body() body: CommentInputModel,
        @CurrentUserId() userId: string,
    ): Promise<void> {
        const commentByCommentId = await this.commentsQueryRepository.findCommentById(commentId)
        if (commentByCommentId.commentatorInfo.userId !== userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        await this.commandBus.execute(
            new UpdateCommentCommand(commentId, body.content)
        )
    }

    @UseGuards(JwtAuthGuard)
    @Put(':commentId/like-status')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateLikeStatus(
        @Param('commentId', IsCommentExistsPipe) commentId: string,
        @Body() body: LikeInputModel,
        @CurrentUserId() userId: string
    ): Promise<void> {
        const isUpdated = await this.commandBus.execute(
            new UpdateLikeStatusForCommentCommand(userId, commentId, body.likeStatus)
        )
        if (!isUpdated) {
            throw new NotImplementedException('Method not implemented.')
        }
    }
}