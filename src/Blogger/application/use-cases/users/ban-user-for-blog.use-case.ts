import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { BansUsersForBlogs } from "../../../domain/blogs/bans-users-for-blogs.entity"
import { UsersTypeORMRepository } from "../../../../SuperAdmin/infrastructure/typeORM/users-typeORM-repository"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-typeORM-repository"

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
        private usersRepository: UsersTypeORMRepository,
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
        private blogsRepository: BlogsTypeORMRepository,
    ) { }


    async execute(command: BanUserForBlogCommand) {
        const blogByBlogId = await this.blogsQueryRepository.findBlogById(command.banUserForBlogInputModel.blogId)

        if (blogByBlogId.user !== command.currentUserId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        const findedUserData = await this.usersRepository.findUserData(command.bannedUserId)

        const banUserForBlog = new BansUsersForBlogs()
        banUserForBlog.user = findedUserData
        banUserForBlog.banReason = command.banUserForBlogInputModel.banReason
        banUserForBlog.blogId = blogByBlogId
        banUserForBlog.isBanned = true
        banUserForBlog.banDate = new Date()

        await this.blogsRepository.dataSourceSave(banUserForBlog)
    }
}