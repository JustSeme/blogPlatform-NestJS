import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotImplementedException,
    Param,
    Put,
    Query,
    UseGuards
} from '@nestjs/common'
import { BasicAuthGuard } from '../../general/guards/basic-auth.guard'
import { IsBlogExistOrThrow400Pipe } from './pipes/isBlogExistsOrThrow400.validation.pipe'
import { IsUserExistOrThrow400Pipe } from './pipes/isUserExistsOrThrow400.validation.pipe'
import { CommandBus } from '@nestjs/cqrs'
import { BindUserCommand } from '../application/use-cases/users/bind-user.use-case'
import { BlogsWithQuerySuperAdminOutputModel } from '../application/dto/blogs/BlogSuperAdminViewModel'
import { ReadBlogsQueryParams } from '../../blogs/api/models/ReadBlogsQuery'
import { BanBlogInputModel } from './models/blogs/BanBlogInputModel'
import { BlogsQueryTypeORMRepository } from '../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository'
import { UpdateBanBlogCommand } from '../application/use-cases/blogs/update-ban-blog.use-case'


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
        const result = await this.commandBus.execute(
            new UpdateBanBlogCommand(banInputModel, blogId)
        )

        if (!result) {
            throw new NotImplementedException('Blog is not banned')
        }
    }
}