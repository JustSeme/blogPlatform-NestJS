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
    Delete,
    NotFoundException,
} from "@nestjs/common"
import { ReadBlogsQueryParams } from "../../blogs/api/models/ReadBlogsQuery"
import { JwtAuthGuard } from "../../general/guards/jwt-auth.guard"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"
import {
    BlogViewModel, BlogsWithQueryOutputModel
} from "../../blogs/application/dto/BlogViewModel"
import { BlogInputModel } from "./models/BlogInputModel"
import { CommandBus } from "@nestjs/cqrs"
import { CreateBlogForBloggerCommand } from "../application/use-cases/blogs/create-blog-for-blogger.use-case"
import { UpdateBlogForBloggerCommand } from "../application/use-cases/blogs/update-blog-for-blogger.use-case"
import { DeleteBlogForBloggerCommand } from "../application/use-cases/blogs/delete-blog-for-blogger.use-case"
import { IsBlogByIdExistPipe } from "../../blogs/api/pipes/isBlogExists.validation.pipe"
import { PostsViewModel } from "../../blogs/application/dto/PostViewModel"
import { CreatePostForBloggerCommand } from "../application/use-cases/posts/create-post-for-blogger.use-case"
import { PostInputModelWithoutBlogId } from "./models/PostInputModelWithoutBlogId"
import { UpdatePostForBloggerCommand } from "../application/use-cases/posts/update-post-for-blogger.use-case"
import { IsPostExistsPipe } from "../../blogs/api/pipes/isPostExists.validation.pipe"
import { DeletePostForBloggerCommand } from "../application/use-cases/posts/delete-post-for-blogger.use-case"
import { ReadCommentsQueryParams } from "../../blogs/api/models/ReadCommentsQuery"
import { CommentsForBloggerWithQueryOutputModel } from "../../blogs/application/dto/CommentViewModelForBlogger"
import { CommentsQueryTypeORMRepository } from "../../blogs/infrastructure/typeORM/comments-query-typeORM-repository"
import { BlogsQueryTypeORMRepository } from "../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"

@UseGuards(JwtAuthGuard)
@Controller('blogger/blogs')
export class BloggerBlogsController {
    constructor(
        private commandBus: CommandBus,
        private commentsQueryRepository: CommentsQueryTypeORMRepository,
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
    ) { }

    @Post('')
    public async createBlog(
        @Body() blogInputModel: BlogInputModel,
        @CurrentUserId() creatorId,
    ): Promise<BlogViewModel> {
        const createdBlog = await this.commandBus.execute(
            new CreateBlogForBloggerCommand(blogInputModel, creatorId)
        )

        return createdBlog
    }

    @Get('')
    public async getBlogsForOwner(
        @Query() blogsQueryParams: ReadBlogsQueryParams,
        @CurrentUserId() userId: string,
    ): Promise<BlogsWithQueryOutputModel> {
        const findedBlogsQueryData = await this.blogsQueryRepository.findBlogsForBlogger(blogsQueryParams, userId)
        findedBlogsQueryData.items = findedBlogsQueryData.items.map(blog => new BlogViewModel(blog))

        if (!findedBlogsQueryData.items.length) {
            throw new NotFoundException('No one blogs is founded')
        }

        return findedBlogsQueryData
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put(':blogId')
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
    @Delete(':blogId')
    public async deleteBlog(
        @Param('blogId', IsBlogByIdExistPipe) blogId: string,
        @CurrentUserId() userId: string,
    ) {
        await this.commandBus.execute(
            new DeleteBlogForBloggerCommand(blogId, userId)
        )
    }

    @Post(':blogId/posts')
    public async createPost(
        @Body() postInputModel: PostInputModelWithoutBlogId,
        @Param('blogId', IsBlogByIdExistPipe) blogId,
        @CurrentUserId() userId
    ): Promise<PostsViewModel> {
        return this.commandBus.execute(
            new CreatePostForBloggerCommand(postInputModel, blogId, userId)
        )
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put(':blogId/posts/:postId')
    public async updatePost(
        @Body() postInputModel: PostInputModelWithoutBlogId,
        @Param('blogId', IsBlogByIdExistPipe) blogId,
        @Param('postId', IsPostExistsPipe) postId,
        @CurrentUserId() userId
    ) {
        await this.commandBus.execute(
            new UpdatePostForBloggerCommand(postInputModel, blogId, postId, userId)
        )
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':blogId/posts/:postId')
    public async deletePost(
        @Param('blogId', IsBlogByIdExistPipe) blogId,
        @Param('postId', IsPostExistsPipe) postId,
        @CurrentUserId() userId
    ) {
        await this.commandBus.execute(
            new DeletePostForBloggerCommand(blogId, postId, userId)
        )
    }

    @Get('comments')
    public async getAllCommentsForAllBloggerBlogs(
        @Query() commentsQueryParams: ReadCommentsQueryParams,
        @CurrentUserId() userId: string,
    ): Promise<CommentsForBloggerWithQueryOutputModel> {
        return this.commentsQueryRepository.getAllCommentsForBlogger(commentsQueryParams, userId)
    }
}