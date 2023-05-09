import { BlogViewModel } from "../application/dto/BlogViewModel"
import { BlogsService } from "../application/blogs-service"
import { BlogsWithQueryOutputModel } from '../application/dto/BlogViewModel'
import { ReadBlogsQueryParams } from "./models/ReadBlogsQuery"
import { IsBlogByIdExistPipe } from "./pipes/isBlogExists.validation.pipe"
import { PostsWithQueryOutputModel } from "../domain/posts/PostsTypes"
import { PostsService } from "../application/posts-service"
import { ReadPostsQueryParams } from "./models/ReadPostsQuery"
import { CommandBus } from "@nestjs/cqrs"
import { GetBlogsCommand } from "../application/use-cases/blogs/get-blogs.use-case"
import { GetBlogByIdCommand } from "../application/use-cases/blogs/get-blog-by-id.use-case"
import { PostsRepository } from "../infrastructure/posts/posts-db-repository"
import { GetPostsForBlogCommand } from "../application/use-cases/blogs/get-posts-for-blog.use-case"
import {
    Controller, Get, Headers, Param, Query
} from "@nestjs/common"

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
}