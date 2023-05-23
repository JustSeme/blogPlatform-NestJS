import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import { UsersRepository } from "../../../../SuperAdmin/infrastructure/users-db-repository"
import { BlogsRepository } from "../../../infrastructure/blogs/blogs-db-repository"
import { generateErrorsMessages } from "../../../../general/helpers"
import { ForbiddenException } from "@nestjs/common"

export class UnbanUserForBlogCommand {
    constructor(
        public userId: string,
        public banUserForBlogInputModel: BanUserForBlogInputModel,
        public currentUserId: string
    ) { }
}


@CommandHandler(UnbanUserForBlogCommand)
export class UnbanUserForBlogUseCase implements ICommandHandler<UnbanUserForBlogCommand> {
    constructor(
        private usersRepository: UsersRepository,
        private blogsRepository: BlogsRepository
    ) { }


    async execute(command: UnbanUserForBlogCommand) {
        const blogByBlogId = await this.blogsRepository.findBlogById(command.banUserForBlogInputModel.blogId)

        if (blogByBlogId.blogOwnerInfo.userId !== command.currentUserId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        await this.usersRepository.unbanUserForCurrentBlog(command.userId, command.banUserForBlogInputModel.blogId)
    }
}