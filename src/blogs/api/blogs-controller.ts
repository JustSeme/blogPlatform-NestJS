import { HTTP_STATUSES } from "src/settings"
import { BlogInputModel } from "../application/dto/BlogInputModel"
import { BlogViewModel } from "./models/BlogViewModel"
import { BlogsService } from "../application/blogs-service"
import { BlogsQueryRepository } from "../infrastructure/blogs/blogs-query-repository"
import { BlogsWithQueryOutputModel } from './models/BlogViewModel'
import { PostInputModel } from "../application/dto/PostInputModel"
import { PostsService } from "../application/posts-service"
import { ReadBlogsQueryParams } from "./models/ReadBlogsQuery"
import { ReadPostsQueryParams } from "./models/ReadPostsQuery"
import { PostsViewModel } from './models/PostViewModel'
import {
    Controller, Get, Param, Query, NotFoundException, Headers, Post, Body, HttpCode, Put, Delete
} from '@nestjs/common'
import { PostsWithQueryOutputModel } from "src/blogs/domain/posts/PostsTypes"

@Controller('blogs')
export class BlogsController {
    constructor(protected blogsService: BlogsService, protected postsService: PostsService, protected blogsQueryRepository: BlogsQueryRepository) { }

    @Get()
    async getBlogs(@Query() blogsQueryParams: ReadBlogsQueryParams): Promise<BlogsWithQueryOutputModel> {
        const findedBlogs = await this.blogsQueryRepository.findBlogs(blogsQueryParams)

        if (!findedBlogs.items.length) {
            throw new NotFoundException()
        }
        return findedBlogs
    }

    @Get(':blogId')
    async getBlogById(@Param('blogId') blogId: string): Promise<BlogViewModel> {
        const findedBlog = await this.blogsQueryRepository.findBlogById(blogId)

        if (!findedBlog) {
            throw new NotFoundException()
        }
        return findedBlog
    }

    @Get(':blogId/posts')
    async getPostsForBlog(
        @Query() queryParams: ReadPostsQueryParams,
        @Param('blogId') blogId: string,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<PostsWithQueryOutputModel> {
        const accessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null
        const findedPostsForBlog = await this.postsService.findPosts(queryParams, blogId, accessToken)

        if (!findedPostsForBlog.items.length) {
            throw new NotFoundException()
        }
        return findedPostsForBlog
    }

    @Post()
    @HttpCode(HTTP_STATUSES.CREATED_201)
    async createBlog(@Body() blogInputModel: BlogInputModel): Promise<BlogViewModel> {
        const createdBlog = await this.blogsService.createBlog(blogInputModel)

        return createdBlog
    }

    @Post(':blogId/posts')
    @HttpCode(HTTP_STATUSES.CREATED_201)
    async createPostForBlog(
        @Body() postInputModel: PostInputModel,
        @Param('blogId') blogId: string,
    ): Promise<PostsViewModel> {
        const createdPost = await this.postsService.createPost(postInputModel, blogId)

        return createdPost
    }

    @Put(':blogId')
    @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
    async updateBlog(
        @Body() blogInputModel: BlogInputModel,
        @Param('blogId') blogId: string,
    ): Promise<void> {
        const isUpdated = await this.blogsService.updateBlog(blogId, blogInputModel)
        if (!isUpdated) {
            throw new NotFoundException()
        }
        return
    }

    @Delete(':id')
    @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
    async deleteBlog(@Param('id') id: string): Promise<void> {
        const isDeleted = await this.blogsService.deleteBlog(id)
        if (!isDeleted) {
            throw new NotFoundException()
        }
        return
    }
}