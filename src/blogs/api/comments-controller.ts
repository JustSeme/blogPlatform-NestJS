import {
    Body,
    Controller, Delete, Get, Headers, HttpCode, HttpStatus, NotFoundException, NotImplementedException, Param, Put
} from "@nestjs/common"
import { CommentsService } from "../application/comments-service"
import { CommentInputModel } from "./models/CommentInputModel"
import { CommentViewModel } from "../application/dto/CommentViewModel"
import { LikeInputModel } from "./models/LikeInputModel"

@Controller('comments')
export class CommentsController {
    constructor(protected commentsService: CommentsService) { }

    @Get(':commentId')
    async getComment(@Param('commentId') commentId: string,
        @Headers('Authorization') authorizationHeader: string,): Promise<CommentViewModel> {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null

        const findedComment = await this.commentsService.getCommentById(commentId, accessToken)
        if (!findedComment) {
            throw new NotFoundException('Comment not found')
        }

        return findedComment
    }

    @Delete(':commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteComment(@Param('commentId') commentId: string): Promise<void> {
        const isDeleted = await this.commentsService.deleteComment(commentId)
        if (!isDeleted) {
            throw new NotFoundException('Comment not found')
        }
    }

    @Put(':commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateComment(
        @Param('commentId') commentId: string,
        @Body() body: CommentInputModel,
    ): Promise<void> {
        const isUpdated = await this.commentsService.updateComment(commentId, body.content)
        if (!isUpdated) {
            throw new NotFoundException('Comment not found')
        }
    }

    @Put(':commentId/like')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateLikeStatus(
        @Param('commentId') commentId: string,
        @Body() body: LikeInputModel,
        @Headers() authorizationHeader: string,
    ): Promise<void> {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null

        const isUpdated = await this.commentsService.updateLike(accessToken, commentId, body.likeStatus)
        if (!isUpdated) {
            throw new NotImplementedException('Method not implemented.')
        }
    }
}