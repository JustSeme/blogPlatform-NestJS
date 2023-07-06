import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import { generateErrorsMessages } from "../../../../general/helpers"
import {
    ForbiddenException, NotFoundException
} from "@nestjs/common"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-typeORM-repository"

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
        private blogsRepository: BlogsTypeORMRepository,
        private blogsQueryRepository: BlogsQueryTypeORMRepository
    ) { }


    async execute(command: UnbanUserForBlogCommand) {
        const blogByBlogId = await this.blogsQueryRepository.findOnlyUnbannedBlogById(command.banUserForBlogInputModel.blogId)

        if (blogByBlogId.user.id !== command.currentUserId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        const existingUserBanForBlog = await this.blogsQueryRepository.findBanUserForBlogByBlogId(command.banUserForBlogInputModel.blogId)

        if (!existingUserBanForBlog) {
            throw new NotFoundException(generateErrorsMessages('Ban for this user by blogId does not exists', 'blogId'))
        }

        await this.blogsRepository.removeBanUserForBlog(existingUserBanForBlog)
    }
}