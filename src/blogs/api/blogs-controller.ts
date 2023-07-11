import { BlogViewModel } from "../application/dto/BlogViewModel"
import { BlogsWithQueryOutputModel } from '../application/dto/BlogViewModel'
import { ReadBlogsQueryParams } from "./models/ReadBlogsQuery"
import { IsBlogByIdExistPipe } from "./pipes/isBlogExists.validation.pipe"
import { PostsWithQueryOutputModel } from "../../Blogger/domain/posts/PostsTypes"
import { ReadPostsQueryParams } from "./models/ReadPostsQuery"
import { CommandBus } from "@nestjs/cqrs"
import {
    Controller, Get, NotFoundException, Param, Query, UseGuards
} from "@nestjs/common"
import { BlogsQueryTypeORMRepository } from "../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { generateErrorsMessages } from "../../general/helpers"
import { PostsQueryTypeORMRepository } from "../../Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository"
import { JwtService } from "../../general/adapters/jwt.adapter"
import { JwtGetUserId } from "../../general/guards/jwt-get-userId.guard"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"

@Controller('blogs')
export class BlogsController {
    constructor(
        protected commandBus: CommandBus,
        protected blogsQueryRepository: BlogsQueryTypeORMRepository,
        protected postsQueryRepository: PostsQueryTypeORMRepository,
        protected jwtService: JwtService
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
        const findedBlogData = await this.blogsQueryRepository.findOnlyUnbannedBlogById(blogId)

        if (!findedBlogData) {
            throw new NotFoundException(generateErrorsMessages('Blog is not found, possible it is banned', 'blogId'))
        }

        return new BlogViewModel(findedBlogData)
    }

    @Get(':blogId/posts')
    @UseGuards(JwtGetUserId)
    async getPostsForBlog(
        @Query() queryParams: ReadPostsQueryParams,
        @Param('blogId', IsBlogByIdExistPipe) blogId: string,
        @CurrentUserId() userId: string | null
    ): Promise<PostsWithQueryOutputModel> {
        return this.postsQueryRepository.findPostsForBlog(queryParams, blogId, userId)
    }
}