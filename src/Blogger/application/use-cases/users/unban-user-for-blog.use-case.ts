import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import { generateErrorsMessages } from "../../../../general/helpers"
import { ForbiddenException } from "@nestjs/common"
import { UsersSQLRepository } from "../../../../SuperAdmin/infrastructure/rawSQL/users-sql-repository"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"

export class UnbanUserForBlogCommand {
    constructor(
        public unbannedUserId: string,
        public banUserForBlogInputModel: BanUserForBlogInputModel,
        public currentUserId: string
    ) { }
}


@CommandHandler(UnbanUserForBlogCommand)
export class UnbanUserForBlogUseCase implements ICommandHandler<UnbanUserForBlogCommand> {
    constructor(
        private usersRepository: UsersSQLRepository,
        private blogsRepository: BlogsQueryTypeORMRepository
    ) { }


    async execute(command: UnbanUserForBlogCommand) {
        const blogByBlogId = await this.blogsRepository.findBlogById(command.banUserForBlogInputModel.blogId)

        if (blogByBlogId.user.id !== command.currentUserId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        await this.usersRepository.unbanUserForCurrentBlog(command.unbannedUserId, command.banUserForBlogInputModel.blogId)
    }
}