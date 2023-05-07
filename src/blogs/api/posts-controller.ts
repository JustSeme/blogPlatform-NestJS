import {
    Controller, Get, Post, Put, Delete, Param, Query, Body, Headers, HttpStatus, HttpCode, UseGuards
} from '@nestjs/common'
import { ReadCommentsQueryParams } from "./models/ReadCommentsQuery"
import { CommentsWithQueryOutputModel } from "../application/dto/CommentViewModel"
import { CommentInputModel } from "./models/CommentInputModel"
import { CommentViewModel } from "../application/dto/CommentViewModel"
import { PostInputModel } from "./models/PostInputModel"
import { ReadPostsQueryParams } from "./models/ReadPostsQuery"
import { LikeInputModel } from "./models/LikeInputModel"
import { PostsViewModel } from "../application/dto/PostViewModel"
import { CurrentUserId } from '../../general/decorators/current-userId.param.decorator'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { IsPostExistsPipe } from './pipes/isPostExists.validation.pipe'
import { PostsWithQueryOutputModel } from '../domain/posts/PostsTypes'
import { CommandBus } from '@nestjs/cqrs'
import { DeletePostsCommand } from '../application/use-cases/posts/delete-post.use-case'
import { CreatePostCommand } from '../application/use-cases/posts/create-post.use-case'
import { UpdatePostCommand } from '../application/use-cases/posts/update-post.use-case'
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
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createPost(
        @Body() post: PostInputModel,
    ): Promise<PostsViewModel> {
        return this.commandBus.execute(
            new CreatePostCommand(post)
        )
    }

    @UseGuards(JwtAuthGuard)
    @Post(':postId/comments')
    async createCommentForPost(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Body() comment: CommentInputModel,
        @CurrentUserId() userId: string,
    ): Promise<CommentViewModel> {
        return this.commandBus.execute(
            new CreateCommentCommand(comment.content, userId, postId)
        )
    }

    @UseGuards(JwtAuthGuard)
    @Put(':postId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePost(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Body() postInputModel: PostInputModel
    ): Promise<void> {
        await this.commandBus.execute(
            new UpdatePostCommand(postId, postInputModel)
        )
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePost(@Param('id', IsPostExistsPipe) id: string): Promise<void> {
        await this.commandBus.execute(
            new DeletePostsCommand(id)
        )
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