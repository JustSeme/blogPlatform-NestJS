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
import { GetBlogsForSuperAdminCommand } from '../application/use-cases/get-blogs-for-super-admin.use-case'
import { BanBlogCommand } from '../application/use-cases/ban-blog.use-case'
import { UnbanBlogCommand } from '../application/use-cases/unban-blog.use-case'


@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SuperAdminBlogsController {
    constructor(
        private commandBus: CommandBus,
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
        return this.commandBus.execute(
            new GetBlogsForSuperAdminCommand(blogsQueryParams)
        )
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