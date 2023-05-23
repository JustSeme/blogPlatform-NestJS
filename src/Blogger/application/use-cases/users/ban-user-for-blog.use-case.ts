import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import { UsersRepository } from "../../../../SuperAdmin/infrastructure/users-db-repository"
import { BlogsRepository } from "../../../infrastructure/blogs/blogs-db-repository"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"

export class BanUserForBlogCommand {
    constructor(
        public bannedUserId: string,
        public banUserForBlogInputModel: BanUserForBlogInputModel,
        public currentUserId: string
    ) { }
}


@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase implements ICommandHandler<BanUserForBlogCommand> {
    constructor(
        private usersRepository: UsersRepository,
        private blogsRepository: BlogsRepository,
    ) { }


    async execute(command: BanUserForBlogCommand) {
        const blogByBlogId = await this.blogsRepository.findBlogById(command.banUserForBlogInputModel.blogId)

        if (!blogByBlogId.isCurrentUserOwner(command.currentUserId)) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        const banInfo = {
            ...command.banUserForBlogInputModel,
            banDate: new Date()
        }

        await this.usersRepository.banUserForCurrentBlog(command.bannedUserId, banInfo)
    }
}