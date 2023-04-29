import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Put,
    Query,
    UseGuards
} from '@nestjs/common'
import { BasicAuthGuard } from '../../blogs/api/guards/basic-auth.guard'
import { IsBlogExistOrThrow400Pipe } from './pipes/isBlogExistsOrThrow400.validation.pipe'
import { IsUserExistOrThrow400Pipe } from './pipes/isUserExistsOrThrow400.validation.pipe'
import { CommandBus } from '@nestjs/cqrs'
import { BindUserCommand } from '../application/use-cases/bind-user.use-case'
import { BlogsWithQuerySuperAdminOutputModel } from '../application/dto/BlogSuperAdminViewModel'
import { BlogsRepository } from '../../blogs/infrastructure/blogs/blogs-db-repository'
import { ReadBlogsQueryParams } from '../../blogs/api/models/ReadBlogsQuery'


@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SuperAdminBlogsController {
    constructor(
        private commandBus: CommandBus,
        private blogsRepository: BlogsRepository,
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
        return this.blogsRepository.findBlogs(blogsQueryParams)
    }
}