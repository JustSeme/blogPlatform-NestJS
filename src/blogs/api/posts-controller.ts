import {
    Controller, Get, Post, Put, Param, Query, Body, Headers, HttpStatus, HttpCode, UseGuards, NotImplementedException
} from '@nestjs/common'
import { ReadCommentsQueryParams } from "./models/ReadCommentsQuery"
import { CommentsWithQueryOutputModel } from "../application/dto/CommentViewModel"
import { CommentInputModel } from "./models/CommentInputModel"
import { CommentViewModel } from "../application/dto/CommentViewModel"
import { ReadPostsQueryParams } from "./models/ReadPostsQuery"
import { LikeInputModel } from "./models/LikeInputModel"
import { PostsViewModel } from "../application/dto/PostViewModel"
import { CurrentUserId } from '../../general/decorators/current-userId.param.decorator'
import { JwtAuthGuard } from '../../general/guards/jwt-auth.guard'
import { IsPostExistsPipe } from './pipes/isPostExists.validation.pipe'
import { PostsWithQueryOutputModel } from '../../Blogger/domain/posts/PostsTypes'
import { CommandBus } from '@nestjs/cqrs'
import { UpdateLikeStatusForPostCommand } from '../application/use-cases/posts/update-like-status-for-post.use-case'
import { CreateCommentCommand } from '../application/use-cases/comments/create-comment.use-case'
import { GetPostsCommand } from '../application/use-cases/posts/get-posts.use-case'
import { GetPostByIdCommand } from '../application/use-cases/posts/get-post-by-id.use-case'
import { GetCommentsForPostCommand } from '../application/use-cases/posts/get-comments-for-post.use-case'

@Controller('posts')
export class PostsController {
    constructor(
        protected commandBus: CommandBus,
    ) { }

    @Get()
    async getPosts(
        @Query() query: ReadPostsQueryParams,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<PostsWithQueryOutputModel> {
        return this.commandBus.execute(
            new GetPostsCommand(query, authorizationHeader)
        )
    }

    @Get(':postId')
    async getPostById(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<PostsViewModel> {
        return this.commandBus.execute(
            new GetPostByIdCommand(postId, authorizationHeader)
        )
    }

    @Get(':postId/comments')
    async getCommentsForPost(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Query() commentsQueryParams: ReadCommentsQueryParams,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<CommentsWithQueryOutputModel> {
        return this.commandBus.execute(
            new GetCommentsForPostCommand(postId, commentsQueryParams, authorizationHeader)
        )
    }

    @UseGuards(JwtAuthGuard)
    @Post(':postId/comments')
    async createCommentForPost(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Body() comment: CommentInputModel,
        @CurrentUserId() userId: string,
    ): Promise<CommentViewModel> {
        const createdComment = await this.commandBus.execute(
            new CreateCommentCommand(comment.content, userId, postId)
        )


        if (!createdComment) {
            throw new NotImplementedException(`Comment wasn't created`)
        }
        return createdComment
    }

    @UseGuards(JwtAuthGuard)
    @Put(':postId/like-status')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateLikeStatus(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Body() likeInputModel: LikeInputModel,
        @CurrentUserId() userId: string
    ): Promise<void> {
        await this.commandBus.execute(
            new UpdateLikeStatusForPostCommand(userId, postId, likeInputModel.likeStatus)
        )
    }
}