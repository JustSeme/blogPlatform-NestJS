import {
    Body,
    Controller, Delete, ForbiddenException, Get, Headers, HttpCode, HttpStatus, NotFoundException, NotImplementedException, Param, Put, UseGuards
} from "@nestjs/common"
import { CommentsService } from "../application/comments-service"
import { CommentInputModel } from "./models/CommentInputModel"
import { CommentViewModel } from "../application/dto/CommentViewModel"
import { LikeInputModel } from "./models/LikeInputModel"
import { CurrentUserId } from "../current-userId.param.decorator"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { IsCommentExistsPipe } from "./pipes/isCommentExists.validation.pipe"
import { generateErrorsMessages } from "src/helpers"

@Controller('comments')
export class CommentsController {
    constructor(protected commentsService: CommentsService) { }

    @Get(':commentId')
    async getComment(@Param('commentId', IsCommentExistsPipe) commentId: string,
        @Headers('Authorization') authorizationHeader: string,): Promise<CommentViewModel> {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null

        const findedComment = await this.commentsService.getCommentById(commentId, accessToken)
        if (!findedComment) {
            throw new NotFoundException(generateErrorsMessages('Comment by commentId paramether is not found', 'commentId'))
        }

        return findedComment
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteComment(@Param('commentId', IsCommentExistsPipe) commentId: string, @CurrentUserId() userId: string): Promise<void> {
        const commentByCommentId = await this.commentsService.getCommentById(commentId, null)
        if (commentByCommentId.commentatorInfo.userId !== userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        const isDeleted = await this.commentsService.deleteComment(commentId)
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
        const commentByCommentId = await this.commentsService.getCommentById(commentId, null)
        if (commentByCommentId.commentatorInfo.userId !== userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'commentId'))
        }

        await this.commentsService.updateComment(commentId, body.content)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':commentId/like-status')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateLikeStatus(
        @Param('commentId', IsCommentExistsPipe) commentId: string,
        @Body() body: LikeInputModel,
        @CurrentUserId() userId: string
    ): Promise<void> {
        const isUpdated = await this.commentsService.updateLike(userId, commentId, body.likeStatus)
        if (!isUpdated) {
            throw new NotImplementedException('Method not implemented.')
        }
    }
}