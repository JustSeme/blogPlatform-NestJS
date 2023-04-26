import {
    Controller, Get, Post, Put, Delete, Param, Query, Body, Headers, HttpStatus, NotFoundException, HttpCode, NotImplementedException, UseGuards
} from '@nestjs/common'
import { ReadCommentsQueryParams } from "./models/ReadCommentsQuery"
import { CommentsWithQueryOutputModel } from "../application/dto/CommentViewModel"
import { CommentInputModel } from "./models/CommentInputModel"
import { CommentViewModel } from "../application/dto/CommentViewModel"
import { CommentsService } from "../application/comments-service"
import { PostInputModel } from "./models/PostInputModel"
import { PostsService } from "../application/posts-service"
import { ReadPostsQueryParams } from "./models/ReadPostsQuery"
import { LikeInputModel } from "./models/LikeInputModel"
import { PostsViewModel } from "../application/dto/PostViewModel"
import { BlogsQueryRepository } from '../infrastructure/blogs/blogs-query-repository'
import { PostsRepository } from '../infrastructure/posts/posts-db-repository'
import { CurrentUserId } from '../../general/decorators/current-userId.param.decorator'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { BasicAuthGuard } from './guards/basic-auth.guard'
import { IsPostExistsPipe } from './pipes/isPostExists.validation.pipe'
import { UsersQueryRepository } from '../../auth/infrastructure/users-query-repository'
import { JwtService } from '../../general/adapters/jwt.adapter'
import { PostsQueryRepository } from '../infrastructure/posts/posts-query-repository'
import { PostsWithQueryOutputModel } from '../domain/posts/PostsTypes'

@Controller('posts')
export class PostsController {
    constructor(
        protected jwtService: JwtService,
        protected postsService: PostsService,
        protected commentsService: CommentsService,
        protected usersQueryRepository: UsersQueryRepository,
        protected blogsQueryRepository: BlogsQueryRepository,
        protected postsQueryRepository: PostsQueryRepository,
        protected postsRepository: PostsRepository,
    ) { }

    @Get()
    async getPosts(@Query() query: ReadPostsQueryParams, @Headers('Authorization') authorizationHeader: string,): Promise<PostsWithQueryOutputModel> {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null
        const postsWithQueryData = await this.postsQueryRepository.findPosts(query, null)

        if (!postsWithQueryData.items.length) {
            throw new NotFoundException()
        }

        const displayedPosts = await this.postsService.transformLikeInfo(postsWithQueryData.items, accessToken)
        const postsViewQueryData = {
            ...postsWithQueryData, items: displayedPosts
        }

        return postsViewQueryData
    }

    @Get(':postId')
    async getPostById(@Param('postId', IsPostExistsPipe) postId: string, @Headers('Authorization') authorizationHeader: string,): Promise<PostsViewModel> {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null
        const findedPost = await this.postsQueryRepository.getPostById(postId)
        if (!findedPost) {
            throw new NotFoundException()
        }

        const displayedPost = this.postsService.transformLikeInfo([findedPost], accessToken)[0]
        return displayedPost
    }

    @Get(':postId/comments')
    async getCommentsForPost(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Query() commentsQueryParams: ReadCommentsQueryParams,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<CommentsWithQueryOutputModel> {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null
        const findedComments = await this.commentsService.getComments(commentsQueryParams, postId, accessToken)
        return findedComments
    }

    @UseGuards(BasicAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createPost(@Body() post: PostInputModel): Promise<PostsViewModel> {
        return this.postsService.createPost(post)
    }

    @UseGuards(JwtAuthGuard)
    @Post(':postId/comments')
    async createCommentForPost(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Body() comment: CommentInputModel,
        @CurrentUserId() userId: string,
    ): Promise<CommentViewModel> {
        const postById = this.postsQueryRepository.getPostById(postId)
        if (!postById) {
            throw new NotFoundException()
        }

        const commentator = await this.usersQueryRepository.findUserById(userId)

        const createdComment = await this.commentsService.createComment(comment.content, commentator, postId)
        if (!createdComment) {
            throw new NotImplementedException()
        }
        return createdComment
    }

    @UseGuards(BasicAuthGuard)
    @Put(':postId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePost(@Param('postId', IsPostExistsPipe) postId: string, @Body() postInputModel: PostInputModel): Promise<void> {
        const isUpdated = await this.postsService.updatePost(postId, postInputModel)
        if (!isUpdated) {
            throw new NotFoundException()
        }
        return
    }

    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePost(@Param('id', IsPostExistsPipe) id: string): Promise<void> {
        const isDeleted = await this.postsService.deletePosts(id)
        if (!isDeleted) {
            throw new NotFoundException()
        }
        return
    }

    @UseGuards(JwtAuthGuard)
    @Put(':postId/like-status')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateLikeStatus(
        @Param('postId', IsPostExistsPipe) postId: string,
        @Body() likeInputModel: LikeInputModel,
        @CurrentUserId() userId: string
    ): Promise<void> {
        const isUpdated = await this.postsService.updateLike(userId, postId, likeInputModel.likeStatus)
        if (!isUpdated) {
            throw new NotFoundException()
        }
        return
    }
}