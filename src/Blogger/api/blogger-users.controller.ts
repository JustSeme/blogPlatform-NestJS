import {
    Body,
    Controller, Get, HttpCode, HttpStatus, Param, Put, Query, UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { JwtAuthGuard } from "../../general/guards/jwt-auth.guard"
import { BanUserForBlogInputModel } from "./models/BanUserForBlogInputModel"
import { BanUserForBlogCommand } from "../application/use-cases/users/ban-user-for-blog.use-case"
import { IsBlogByIdExistPipe } from "../../blogs/api/pipes/isBlogExists.validation.pipe"
import { ReadBannedUsersQueryParams } from "./models/ReadBannedUsersQueryParams"
import { BannedUsersOutputModel } from "../application/dto/BannedUserViewModel"
import { GetAllBannedUsersForBlogCommand } from "../application/use-cases/users/get-all-banned-users-for-blog.use-case"
import { UnbanUserForBlogCommand } from "../application/use-cases/users/unban-user-for-blog.use-case"
import { IsUserExistPipe } from "../../SuperAdmin/api/pipes/isUserExists.validation.pipe"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"

@UseGuards(JwtAuthGuard)
@Controller('blogger/users')
export class BloggerUsersController {
    constructor(
        private commandBus: CommandBus
    ) { }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put(':userId/ban')
    public async banUserForBlog(
        @Param('userId', IsUserExistPipe) bannedUserId: string,
        @Body() banInputModel: BanUserForBlogInputModel,
        @CurrentUserId() userId: string,
    ) {
        if (banInputModel.isBanned) {
            await this.commandBus.execute(
                new BanUserForBlogCommand(bannedUserId, banInputModel, userId)
            )
        } else {
            await this.commandBus.execute(
                new UnbanUserForBlogCommand(bannedUserId, banInputModel, userId)
            )
        }
    }

    @Get('blog/:blogId')
    public async getAllBannedUsersForBlog(
        @Param('blogId', IsBlogByIdExistPipe) blogId: string,
        @Query() readBannedUsersQuery: ReadBannedUsersQueryParams,
    ): Promise<BannedUsersOutputModel> {
        return this.commandBus.execute(
            new GetAllBannedUsersForBlogCommand(blogId, readBannedUsersQuery)
        )
    }
}