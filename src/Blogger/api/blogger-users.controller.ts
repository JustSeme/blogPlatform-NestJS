import {
    Body,
    Controller, Get, HttpCode, HttpStatus, Param, Put, UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { JwtAuthGuard } from "../../general/guards/jwt-auth.guard"
import { BanUserForBlogInputModel } from "./models/BanUserForBlogInputModel"
import { BanUserForBlogCommand } from "../application/use-cases/users/ban-user-for-blog.use-case"
import { IsUserExistOrThrow400Pipe } from "../../SuperAdmin/api/pipes/isUserExistsOrThrow400.validation.pipe"
import { IsBlogByIdExistPipe } from "../../blogs/api/pipes/isBlogExists.validation.pipe"

@UseGuards(JwtAuthGuard)
@Controller('blogger/users')
export class BloggerUsersController {
    constructor(
        private commandBus: CommandBus
    ) { }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put(':userId/ban')
    public async banUserForBlog(
        @Param('userId', IsUserExistOrThrow400Pipe) userId: string,
        @Body() banInputModel: BanUserForBlogInputModel,
    ) {
        await this.commandBus.execute(
            new BanUserForBlogCommand(userId, banInputModel)
        )
    }

    @Get('blog/:blogId')
    public async getAllBannedUsersForBlog(
        @Param('blogId', IsBlogByIdExistPipe) blogId: string
    ) {
        return
    }
}