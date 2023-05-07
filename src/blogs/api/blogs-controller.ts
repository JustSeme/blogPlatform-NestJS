import { BlogInputModel } from "./models/BlogInputModel"
import { BlogViewModel } from "../application/dto/BlogViewModel"
import { BlogsService } from "../application/blogs-service"
import { BlogsWithQueryOutputModel } from '../application/dto/BlogViewModel'
import { ReadBlogsQueryParams } from "./models/ReadBlogsQuery"
import { PostsViewModel } from '../application/dto/PostViewModel'
import {
    Controller, Get, Param, Query, NotFoundException, Headers, Post, Body, HttpCode, Put, Delete, HttpStatus, UseGuards
} from '@nestjs/common'
import { BasicAuthGuard } from "../../general/guards/basic-auth.guard"
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
import { CreatePostCommand } from "../application/use-cases/posts/create-post.use-case"
import { GetBlogsCommand } from "../application/use-cases/blogs/get-blogs.use-case"
import { GetBlogByIdCommand } from "../application/use-cases/blogs/get-blog-by-id.use-case"
import { PostsRepository } from "../infrastructure/posts/posts-db-repository"
import { GetPostsForBlogCommand } from "../application/use-cases/blogs/get-posts-for-blog.use-case"

@Controller('blogs')
export class BlogsController {
    constructor(
        protected blogsService: BlogsService,
        protected postsService: PostsService,
        protected postsRepository: PostsRepository,
        protected commandBus: CommandBus,
    ) { }

    @Get()
    async getBlogs(@Query() blogsQueryParams: ReadBlogsQueryParams): Promise<BlogsWithQueryOutputModel> {
        return this.commandBus.execute(
            new GetBlogsCommand(blogsQueryParams)
        )
    }

    @Get(':blogId')
    async getBlogById(
        @Param('blogId', IsBlogByIdExistPipe) blogId: string
    ): Promise<BlogViewModel> {
        return this.commandBus.execute(
            new GetBlogByIdCommand(blogId)
        )
    }

    @Get(':blogId/posts')
    async getPostsForBlog(
        @Query() queryParams: ReadPostsQueryParams,
        @Param('blogId', IsBlogByIdExistPipe) blogId: string,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<PostsWithQueryOutputModel> {
        return this.commandBus.execute(
            new GetPostsForBlogCommand(queryParams, blogId, authorizationHeader)
        )
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

        const createdPost = await this.commandBus.execute(
            new CreatePostCommand(postInputModel)
        )

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