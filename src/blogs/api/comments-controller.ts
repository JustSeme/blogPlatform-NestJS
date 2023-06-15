import {
    Body,
    Controller, Delete, Get, Headers, HttpCode, HttpStatus, NotImplementedException, Param, Put, UseGuards
} from "@nestjs/common"
import { CommentsService } from "../application/comments-service"
import { CommentInputModel } from "./models/CommentInputModel"
import { CommentViewModel } from "../application/dto/CommentViewModel"
import { LikeInputModel } from "./models/LikeInputModel"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"
import { JwtAuthGuard } from "../../general/guards/jwt-auth.guard"
import { IsCommentExistsPipe } from "./pipes/isCommentExists.validation.pipe"
import { CommandBus } from "@nestjs/cqrs"
import { DeleteCommentCommand } from "../application/use-cases/comments/delete-comment.use-case"
import { UpdateCommentCommand } from "../application/use-cases/comments/update-comment.use-case"
import { UpdateLikeStatusForCommentCommand } from "../application/use-cases/comments/update-like-status-for-comment.use-case"
import { CommentsRepository } from "../infrastructure/comments/comments-db-repository"
import { GetCommentByIdCommand } from "../application/use-cases/comments/get-comment-by-id.use-case"

@Controller('comments')
export class CommentsController {
    constructor(
        protected commentsService: CommentsService,
        protected commentsRepository: CommentsRepository,
        protected commandBus: CommandBus,
    ) { }

    @Get(':commentId')
    async getComment(
        @Param('commentId', IsCommentExistsPipe) commentId: string,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<CommentViewModel> {
        return this.commandBus.execute(
            new GetCommentByIdCommand(commentId, authorizationHeader)
        )
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteComment(
        @Param('commentId', IsCommentExistsPipe)
        commentId: string,
        @CurrentUserId() userId: string
    ): Promise<void> {
        const isDeleted = await this.commandBus.execute(
            new DeleteCommentCommand(commentId, userId)
        )

        if (!isDeleted) {
            throw new NotImplementedException()
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
        await this.commandBus.execute(
            new UpdateCommentCommand(commentId, body.content, userId)
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