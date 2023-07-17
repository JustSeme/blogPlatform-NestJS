import {
    Body,
    Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, NotImplementedException, Param, Put, UseGuards
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
import { CommentsQueryTypeORMRepository } from "../infrastructure/typeORM/comments-query-typeORM-repository"
import { generateErrorsMessages } from "../../general/helpers/helpers"
import { JwtGetUserId } from "../../general/guards/jwt-get-userId.guard"

@Controller('comments')
export class CommentsController {
    constructor(
        protected commentsService: CommentsService,
        protected commandBus: CommandBus,
        protected commentsQueryRepository: CommentsQueryTypeORMRepository,
    ) { }

    @Get(':commentId')
    @UseGuards(JwtGetUserId)
    async getComment(
        @Param('commentId', IsCommentExistsPipe) commentId: string,
        @CurrentUserId() userId: string | null,
    ): Promise<CommentViewModel> {
        const commentById = await this.commentsQueryRepository.getCommentByIdWithLikesInfo(commentId, userId)

        if (!commentById) {
            throw new NotFoundException(generateErrorsMessages('This comment is not found, possible it is banned', 'isBanned'))
        }

        return commentById
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