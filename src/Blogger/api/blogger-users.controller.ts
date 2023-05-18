import {
    Body,
    Controller, Param, Put, UseGuards
} from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { JwtAuthGuard } from "../../general/guards/jwt-auth.guard"
import { BanUserForBlogInputModel } from "./models/BanUserForBlogInputModel"
import { BanUserForBlogCommand } from "../application/use-cases/users/ban-user-for-blog.use-case"

@UseGuards(JwtAuthGuard)
@Controller('blogger/users')
export class BloggerUsersController {
    constructor(
        private commandBus: CommandBus
    ) { }

    @Put(':userId/ban')
    public async banUserForBlog(
        @Param('userId') userId: string,
        @Body() banInputModel: BanUserForBlogInputModel,
    ) {
        await this.commandBus.execute(
            new BanUserForBlogCommand(userId, banInputModel)
        )
    }
}