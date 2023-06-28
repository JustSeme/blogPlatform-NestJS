import { BlogViewModel } from "../application/dto/BlogViewModel"
import { BlogsWithQueryOutputModel } from '../application/dto/BlogViewModel'
import { ReadBlogsQueryParams } from "./models/ReadBlogsQuery"
import { IsBlogByIdExistPipe } from "./pipes/isBlogExists.validation.pipe"
import { PostsWithQueryOutputModel } from "../../Blogger/domain/posts/PostsTypes"
import { ReadPostsQueryParams } from "./models/ReadPostsQuery"
import { CommandBus } from "@nestjs/cqrs"
import { GetPostsForBlogCommand } from "../application/use-cases/blogs/get-posts-for-blog.use-case"
import {
    Controller, Get, Headers, NotFoundException, Param, Query
} from "@nestjs/common"
import { BlogsQuerySQLRepository } from "../../Blogger/infrastructure/blogs/rawSQL/blogs-query-sql-repository"
import { BlogsQueryTypeORMRepository } from "../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"

@Controller('blogs')
export class BlogsController {
    constructor(
        protected commandBus: CommandBus,
        protected blogsQueryRepository: BlogsQuerySQLRepository,
        protected blogsQueryTypeORMRepository: BlogsQueryTypeORMRepository,
    ) { }

    @Get()
    async getBlogs(@Query() blogsQueryParams: ReadBlogsQueryParams): Promise<BlogsWithQueryOutputModel> {
        const findedBlogsData = await this.blogsQueryRepository.findBlogs(blogsQueryParams)

        if (!findedBlogsData.items.length) {
            throw new NotFoundException('No one blogs founded')
        }

        return findedBlogsData
    }

    @Get(':blogId')
    async getBlogById(
        @Param('blogId', IsBlogByIdExistPipe) blogId: string
    ): Promise<BlogViewModel> {
        const findedBlogData = await this.blogsQueryTypeORMRepository.findBlogById(blogId)

        return new BlogViewModel(findedBlogData)
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