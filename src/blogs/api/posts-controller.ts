import {
    Controller, Get, Post, Put, Param, Query, Body, HttpStatus, HttpCode, UseGuards, NotImplementedException
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
import { GetPostByIdCommand } from '../application/use-cases/posts/get-post-by-id.use-case'
import { GetCommentsForPostCommand } from '../application/use-cases/posts/get-comments-for-post.use-case'
import { JwtService } from '../../general/adapters/jwt.adapter'
import { PostsQueryTypeORMRepository } from '../../Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository'
import { JwtGetUserId } from '../../general/guards/jwt-get-userId.guard'

@Controller('posts')
export class PostsController {
    constructor(
        protected commandBus: CommandBus,
        protected postsQueryRepository: PostsQueryTypeORMRepository,
        protected jwtService: JwtService,
    ) { }

    @Get()
    @UseGuards(JwtGetUserId)
    async getPosts(
        @Query() query: ReadPostsQueryParams,
        @CurrentUserId() userId: string | null,
    ): Promise<PostsWithQueryOutputModel> {
        return this.postsQueryRepository.findPosts(query, userId)
    }

    @Get(':postId')
    @UseGuards(JwtGetUserId)
    async getPostById(
        @Param('postId', IsPostExistsPipe) postId: string,
        @CurrentUserId() userId: string | null,
    ): Promise<PostsViewModel> {
        return this.commandBus.execute(
            new GetPostByIdCommand(postId, authorizationHeader)
        )
    }

    @Get(':postId/comments')
    @UseGuards(JwtGetUserId)
    async getCommentsForPost(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Query() commentsQueryParams: ReadCommentsQueryParams,
        @CurrentUserId() userId: string | null,
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