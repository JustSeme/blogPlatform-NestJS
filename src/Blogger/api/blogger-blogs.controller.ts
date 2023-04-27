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
    HttpStatus
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
import { CreateBlogForBloggerCommand } from "./use-cases/create-blog-for-blogger.use-case"
import { UpdateBlogForBloggerCommand } from "./use-cases/update-blog-for-blogger.use-case"

@Controller('blogger')
export class BloggerBlogsController {
    constructor(
        private blogsQueryRepository: BlogsQueryRepository,
        private commandBus: CommandBus,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('blogs')
    public async createBlog(
        @Body() blogInputModel: BlogInputModel,
        @CurrentUserId() creatorId,
    ): Promise<BlogViewModel> {
        const createdBlog = this.commandBus.execute(
            new CreateBlogForBloggerCommand(blogInputModel, creatorId)
        )

        return createdBlog
    }

    @UseGuards(JwtAuthGuard)
    @Get('blogs')
    public async getBlogsForOwner(
        @Query() blogsQueryParams: ReadBlogsQueryParams,
        @CurrentUserId() userId: string,
    ): Promise<BlogsWithQueryOutputModel> {
        return this.blogsQueryRepository.findBlogs(blogsQueryParams, userId)
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Put('blogs/:blogId')
    public async updateBlog(
        @Body() blogInputModel: BlogInputModel,
        @Param('blogId') blogId: string,
        @CurrentUserId() userId: string,
    ) {
        await this.commandBus.execute(
            new UpdateBlogForBloggerCommand(blogInputModel, blogId, userId)
        )
    }
}