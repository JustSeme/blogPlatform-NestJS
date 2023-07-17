import {
    NotFoundException, ForbiddenException
} from "@nestjs/common"
import {
    CommandHandler, ICommandHandler,
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import { BansUsersForBlogs } from "../../../domain/blogs/typeORM/bans-users-for-blogs.entity"
import { UsersTypeORMRepository } from "../../../../SuperAdmin/infrastructure/typeORM/users-typeORM-repository"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-typeORM-repository"
import { UserEntity } from "../../../../SuperAdmin/domain/typeORM/user.entity"
import { BlogEntity } from "../../../domain/blogs/typeORM/blog.entity"
import { generateErrorsMessages } from "../../../../general/helpers/helpers"

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
        const blogByBlogId = await this.blogsQueryRepository.findOnlyUnbannedBlogById(command.banUserForBlogInputModel.blogId)

        //TODO добавить обработку CustomResponse в controller
        if (!blogByBlogId) {
            throw new NotFoundException(generateErrorsMessages('This blog is banned', 'isBanned'))
        }

        if (blogByBlogId.user.id !== command.currentUserId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        const findedUserData = await this.usersRepository.findUserData(command.bannedUserId)

        const existingUserBanForBlog = await this.blogsQueryRepository.findBanUserForBlogByBlogId(command.banUserForBlogInputModel.blogId, command.bannedUserId)

        let banUserForBlog

        if (existingUserBanForBlog) {
            // edit banDate, banReason, isBanned and return the same ban
            banUserForBlog = this.editExistingBanForBlog(
                existingUserBanForBlog,
                command.banUserForBlogInputModel.banReason,
                command.banUserForBlogInputModel.isBanned
            )
        } else {
            if (!command.banUserForBlogInputModel.isBanned) {
                // return if command want to unban user and this user is not banned
                return true
            }

            // create new ban entity 
            banUserForBlog = this.createBanUserForBlog(
                findedUserData,
                blogByBlogId,
                command.banUserForBlogInputModel.banReason,
                command.banUserForBlogInputModel.isBanned
            )
        }

        const savedBan = await this.blogsRepository.dataSourceSave(banUserForBlog)

        return savedBan ? true : false
    }

    editExistingBanForBlog(banForBlog: BansUsersForBlogs, banReason: string, isBanned: boolean): BansUsersForBlogs {
        banForBlog.banReason = banReason
        banForBlog.isBanned = isBanned
        banForBlog.banDate = new Date()

        return banForBlog
    }

    createBanUserForBlog(user: UserEntity, blog: BlogEntity, banReason: string, isBanned: boolean): BansUsersForBlogs {
        const banUserForBlog = new BansUsersForBlogs()

        banUserForBlog.user = user
        banUserForBlog.blog = blog

        banUserForBlog.banReason = banReason
        banUserForBlog.isBanned = isBanned
        banUserForBlog.banDate = new Date()

        return banUserForBlog
    }
}