import {
    Post,
    Controller,
    Get,
    Query,
    UseGuards,
    Body,
    Put,
    Param,
    HttpCode,
    HttpStatus,
    Delete
} from "@nestjs/common"
import { ReadBlogsQueryParams } from "../../blogs/api/models/ReadBlogsQuery"
import { JwtAuthGuard } from "../../blogs/api/guards/jwt-auth.guard"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"
import {
    BlogViewModel, BlogsWithQueryOutputModel
} from "../../blogs/application/dto/BlogViewModel"
import { BlogsQueryRepository } from "../../blogs/infrastructure/blogs/blogs-query-repository"
import { BlogInputModel } from "../../blogs/api/models/BlogInputModel"
import { CommandBus } from "@nestjs/cqrs"
import { CreateBlogForBloggerCommand } from "./use-cases/blogs/create-blog-for-blogger.use-case"
import { UpdateBlogForBloggerCommand } from "./use-cases/blogs/update-blog-for-blogger.use-case"
import { DeleteBlogForBloggerCommand } from "./use-cases/blogs/delete-blog-for-blogger.use-case"
import { IsBlogByIdExistPipe } from "../../blogs/api/pipes/isBlogExists.validation.pipe"
import { PostsViewModel } from "../../blogs/application/dto/PostViewModel"
import { CreatePostForBloggerCommand } from "./use-cases/posts/create-post-for-blogger.use-case"
import { PostInputModelWithoutBlogId } from "../../blogs/api/models/PostInputModelWithoutBlogId"

@UseGuards(JwtAuthGuard)
@Controller('blogger/blogs')
export class BloggerBlogsController {
    constructor(
        private blogsQueryRepository: BlogsQueryRepository,
        private commandBus: CommandBus,
    ) { }

    @Post('')
    public async createBlog(
        @Body() blogInputModel: BlogInputModel,
        @CurrentUserId() creatorId,
    ): Promise<BlogViewModel> {
        const createdBlog = this.commandBus.execute(
            new CreateBlogForBloggerCommand(blogInputModel, creatorId)
        )

        return createdBlog
    }

    @Get('')
    public async getBlogsForOwner(
        @Query() blogsQueryParams: ReadBlogsQueryParams,
        @CurrentUserId() userId: string,
    ): Promise<BlogsWithQueryOutputModel> {
        return this.blogsQueryRepository.findBlogs(blogsQueryParams, userId)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put('/:blogId')
    public async updateBlog(
        @Body() blogInputModel: BlogInputModel,
        @Param('blogId', IsBlogByIdExistPipe) blogId: string,
        @CurrentUserId() userId: string,
    ) {
        await this.commandBus.execute(
            new UpdateBlogForBloggerCommand(blogInputModel, blogId, userId)
        )
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/:blogId')
    public async deleteBlog(
        @Param('blogId', IsBlogByIdExistPipe) blogId: string,
        @CurrentUserId() userId: string,
    ) {
        await this.commandBus.execute(
            new DeleteBlogForBloggerCommand(blogId, userId)
        )
    }

    @Post('/:blogId/posts')
    public async createPost(
        @Body() postInputModel: PostInputModelWithoutBlogId,
        @Param('blogId', IsBlogByIdExistPipe) blogId,
        @CurrentUserId() userId
    ): Promise<PostsViewModel> {
        const createdPostViewModel = await this.commandBus.execute(
            new CreatePostForBloggerCommand(postInputModel, blogId, userId)
        )
        return createdPostViewModel
    }
}