import {
    Controller, Get, Post, Put, Delete, Param, Query, Body, Headers, HttpStatus, NotFoundException, HttpCode, NotImplementedException, UseGuards, Request
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
import { UsersQueryRepository } from 'src/auth/infrastructure/users-query-repository'
import { JwtService } from 'src/adapters/jwtService'
import { BlogsQueryRepository } from '../infrastructure/blogs/blogs-query-repository'
import { PostsRepository } from '../infrastructure/posts/posts-db-repository'
import { BasicAuthGuard } from 'src/guards/basic.auth.guard'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

@Controller('posts')
export class PostsController {
    constructor(protected jwtService: JwtService, protected postsService: PostsService, protected commentsService: CommentsService, protected usersQueryRepository: UsersQueryRepository, protected blogsQueryRepository: BlogsQueryRepository, protected postsRepository: PostsRepository) { }

    @Get()
    async getPosts(@Query() query: ReadPostsQueryParams, @Headers('Authorization') authorizationHeader: string,) {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null
        const findedPosts = await this.postsService.findPosts(query, null, accessToken)

        if (!findedPosts.items.length) {
            throw new NotFoundException()
        }

        return findedPosts
    }

    @Get(':postId')
    async getPostById(@Param('postId') postId: string, @Headers('Authorization') authorizationHeader: string,): Promise<PostsViewModel> {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null
        const findedPosts = await this.postsService.findPostById(postId, accessToken)
        if (!findedPosts) {
            throw new NotFoundException()
        }
        return findedPosts
    }

    @Get(':postId/comments')
    async getCommentsForPost(
        @Param('postId') postId: string,
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
        const blogById = await this.blogsQueryRepository.findBlogById(post.blogId)
        if (!blogById) {
            throw new NotFoundException()
        }

        return this.postsService.createPost(post, null)
    }

    @UseGuards(JwtAuthGuard)
    @Post(':postId/comments')
    async createCommentForPost(
        @Param('postId') postId: string,
        @Body() comment: CommentInputModel,
        @Request() req,
    ): Promise<CommentViewModel> {
        const postById = this.postsRepository.getPostById(postId)
        if (!postById) {
            throw new NotFoundException()
        }

        const commentator = await this.usersQueryRepository.findUserById(req.user.userId)

        const createdComment = await this.commentsService.createComment(comment.content, commentator, postId)
        if (!createdComment) {
            throw new NotImplementedException()
        }
        return createdComment
    }

    @UseGuards(BasicAuthGuard)
    @Put(':postId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePost(@Param('postId') postId: string, @Body() postInputModel: PostInputModel): Promise<void> {
        const isUpdated = await this.postsService.updatePost(postId, postInputModel)
        if (!isUpdated) {
            throw new NotFoundException()
        }
        return
    }

    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePost(@Param('id') id: string): Promise<void> {
        const isDeleted = await this.postsService.deletePosts(id)
        if (!isDeleted) {
            throw new NotFoundException()
        }
        return
    }

    @UseGuards(JwtAuthGuard)
    @Put(':postId/like-status')
    async updateLikeStatus(
        @Param('postId') postId: string,
        @Body() like: LikeInputModel,
        @Request() req
    ): Promise<void> {
        const isUpdated = await this.postsService.updateLike(req.user.userId, postId, like.likeStatus)
        if (!isUpdated) {
            throw new NotImplementedException()
        }
        return
    }
}