import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Put,
    Query,
    UseGuards
} from '@nestjs/common'
import { BasicAuthGuard } from '../../general/guards/basic-auth.guard'
import { IsBlogExistOrThrow400Pipe } from './pipes/isBlogExistsOrThrow400.validation.pipe'
import { IsUserExistOrThrow400Pipe } from './pipes/isUserExistsOrThrow400.validation.pipe'
import { CommandBus } from '@nestjs/cqrs'
import { BindUserCommand } from '../application/use-cases/bind-user.use-case'
import { BlogsWithQuerySuperAdminOutputModel } from '../application/dto/BlogSuperAdminViewModel'
import { ReadBlogsQueryParams } from '../../blogs/api/models/ReadBlogsQuery'
import { BanBlogInputModel } from './models/BanBlogInputModel'
import { BanBlogCommand } from '../application/use-cases/ban-blog.use-case'
import { UnbanBlogCommand } from '../application/use-cases/unban-blog.use-case'
import { BlogsQueryTypeORMRepository } from '../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository'


@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SuperAdminBlogsController {
    constructor(
        private commandBus: CommandBus,
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
    ) { }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put(':blogId/bind-with-user/:userId')
    async bindBlogWithUser(
        @Param('blogId', IsBlogExistOrThrow400Pipe) blogId,
        @Param('userId', IsUserExistOrThrow400Pipe) userId,
    ) {
        await this.commandBus.execute(
            new BindUserCommand(blogId, userId)
        )
    }

    @Get('')
    async getBlogs(
        @Query() blogsQueryParams: ReadBlogsQueryParams,
    ): Promise<BlogsWithQuerySuperAdminOutputModel> {
        return this.blogsQueryRepository.findBlogsForSuperAdmin(blogsQueryParams)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put(':blogId/ban')
    async banBlog(
        @Body() banInputModel: BanBlogInputModel,
        @Param('blogId', IsBlogExistOrThrow400Pipe) blogId,
    ) {
        if (banInputModel.isBanned) {
            await this.commandBus.execute(
                new BanBlogCommand(banInputModel, blogId)
            )
        } else {
            await this.commandBus.execute(
                new UnbanBlogCommand(banInputModel, blogId)
            )
        }
    }
}