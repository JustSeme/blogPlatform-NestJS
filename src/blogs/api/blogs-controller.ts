import { BlogInputModel } from "./models/BlogInputModel"
import { BlogViewModel } from "../application/dto/BlogViewModel"
import { BlogsService } from "../application/blogs-service"
import { BlogsQueryRepository } from "../infrastructure/blogs/blogs-query-repository"
import { BlogsWithQueryOutputModel } from '../application/dto/BlogViewModel'
import { PostsService } from "../application/posts-service"
import { ReadBlogsQueryParams } from "./models/ReadBlogsQuery"
import { ReadPostsQueryParams } from "./models/ReadPostsQuery"
import { PostsViewModel } from '../application/dto/PostViewModel'
import {
    Controller, Get, Param, Query, NotFoundException, Headers, Post, Body, HttpCode, Put, Delete, HttpStatus, UseGuards
} from '@nestjs/common'
import { PostsWithQueryOutputModel } from "src/blogs/domain/posts/PostsTypes"
import { BasicAuthGuard } from "./guards/basic-auth.guard"
import { PostInputModelWithoutBlogId } from "./models/PostInputModelWithoutBlogId"
import { PostInputModel } from "./models/PostInputModel"
import { IsBlogByIdExistPipe } from "./pipes/isBlogExists.validation.pipe"

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

    @UseGuards(BasicAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createBlog(@Body() blogInputModel: BlogInputModel): Promise<BlogViewModel> {
        const createdBlog = await this.blogsService.createBlog(blogInputModel)

        return createdBlog
    }

    @UseGuards(BasicAuthGuard)
    @Post(':blogId/posts')
    @HttpCode(HttpStatus.CREATED)
    async createPostForBlog(
        @Body() postInputModelWithoutBlogId: PostInputModelWithoutBlogId,
        @Param('blogId', IsBlogByIdExistPipe) blogId: string,
    ): Promise<PostsViewModel> {
        const blogById = await this.blogsQueryRepository.findBlogById(blogId)
        if (!blogById) {
            throw new NotFoundException()
        }

        const postInputModel: PostInputModel = {
            ...postInputModelWithoutBlogId, blogId: blogId
        }

        const createdPost = await this.postsService.createPost(postInputModel)

        return createdPost
    }

    @UseGuards(BasicAuthGuard)
    @Put(':blogId')
    @HttpCode(HttpStatus.NO_CONTENT)
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

    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBlog(@Param('id') id: string): Promise<void> {
        const isDeleted = await this.blogsService.deleteBlog(id)
        if (!isDeleted) {
            throw new NotFoundException()
        }
        return
    }
}