import { BlogInputModel } from "./models/BlogInputModel"
import { BlogViewModel } from "../application/dto/BlogViewModel"
import { BlogsService } from "../application/blogs-service"
import { BlogsQueryRepository } from "../infrastructure/blogs/blogs-query-repository"
import { BlogsWithQueryOutputModel } from '../application/dto/BlogViewModel'
import { ReadBlogsQueryParams } from "./models/ReadBlogsQuery"
import { PostsViewModel } from '../application/dto/PostViewModel'
import {
    Controller, Get, Param, Query, NotFoundException, Headers, Post, Body, HttpCode, Put, Delete, HttpStatus, UseGuards
} from '@nestjs/common'
import { BasicAuthGuard } from "./guards/basic-auth.guard"
import { PostInputModelWithoutBlogId } from "./models/PostInputModelWithoutBlogId"
import { PostInputModel } from "./models/PostInputModel"
import { IsBlogByIdExistPipe } from "./pipes/isBlogExists.validation.pipe"
import { PostsWithQueryOutputModel } from "../domain/posts/PostsTypes"
import { PostsService } from "../application/posts-service"
import { ReadPostsQueryParams } from "./models/ReadPostsQuery"
import { CommandBus } from "@nestjs/cqrs"
import { DeleteBlogCommand } from "../application/use-cases/blogs/delete-blog.use-case"
import { CreateBlogCommand } from "../application/use-cases/blogs/create-blog.use-case"
import { UpdateBlogCommand } from "../application/use-cases/blogs/update-blog.use-case"
import { PostsQueryRepository } from "../infrastructure/posts/posts-query-repository"

@Controller('blogs')
export class BlogsController {
    constructor(
        protected blogsService: BlogsService,
        protected postsService: PostsService,
        protected blogsQueryRepository: BlogsQueryRepository,
        protected postsQueryRepository: PostsQueryRepository,
        protected commandBus: CommandBus,
    ) { }

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
        const postsWithQueryData = await this.postsQueryRepository.findPosts(queryParams, blogId)

        if (!postsWithQueryData.items.length) {
            throw new NotFoundException()
        }
        const displayedPosts = await this.postsService.transformLikeInfo(postsWithQueryData.items, accessToken)
        const postsViewQueryData = {
            ...postsWithQueryData, items: displayedPosts
        }

        return postsViewQueryData
    }

    @UseGuards(BasicAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createBlog(@Body() blogInputModel: BlogInputModel): Promise<BlogViewModel> {
        const createdBlog = await this.commandBus.execute(
            new CreateBlogCommand(blogInputModel)
        )

        return createdBlog
    }

    @UseGuards(BasicAuthGuard)
    @Post(':blogId/posts')
    @HttpCode(HttpStatus.CREATED)
    async createPostForBlog(
        @Body() postInputModelWithoutBlogId: PostInputModelWithoutBlogId,
        @Param('blogId', IsBlogByIdExistPipe) blogId: string,
    ): Promise<PostsViewModel> {
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
        const isUpdated = await this.commandBus.execute(
            new UpdateBlogCommand(blogId, blogInputModel)
        )

        if (!isUpdated) {
            throw new NotFoundException()
        }
        return
    }

    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBlog(@Param('id') id: string): Promise<void> {
        const isDeleted = await this.commandBus.execute(
            new DeleteBlogCommand(id)
        )
        if (!isDeleted) {
            throw new NotFoundException()
        }
        return
    }
}