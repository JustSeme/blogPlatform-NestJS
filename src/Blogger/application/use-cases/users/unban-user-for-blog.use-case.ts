import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import { generateErrorsMessages } from "../../../../general/helpers"
import { ForbiddenException } from "@nestjs/common"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/blogs-sql-repository"
import { UsersSQLRepository } from "../../../../SuperAdmin/infrastructure/users-sql-repository"

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
        private blogsRepository: BlogsSQLRepository
    ) { }


    async execute(command: UnbanUserForBlogCommand) {
        const blogByBlogId = await this.blogsRepository.findBlogById(command.banUserForBlogInputModel.blogId)

        if (blogByBlogId.blogOwnerInfo.userId !== command.currentUserId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        await this.usersRepository.unbanUserForCurrentBlog(command.unbannedUserId, command.banUserForBlogInputModel.blogId)
    }
}