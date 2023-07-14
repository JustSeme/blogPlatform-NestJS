import {
    CommandHandler, ICommandHandler,
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import {
    ForbiddenException, NotFoundException
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { BansUsersForBlogs } from "../../../domain/blogs/typeORM/bans-users-for-blogs.entity"
import { UsersTypeORMRepository } from "../../../../SuperAdmin/infrastructure/typeORM/users-typeORM-repository"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-typeORM-repository"
import { UserEntity } from "../../../../SuperAdmin/domain/typeORM/user.entity"
import { BlogEntity } from "../../../domain/blogs/typeORM/blog.entity"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"

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
        @InjectRepository(BansUsersForBlogs) private bU: Repository<BansUsersForBlogs>
    ) { }


    async execute(command: BanUserForBlogCommand) {
        const blogByBlogId = await this.blogsQueryRepository.findOnlyUnbannedBlogById(command.banUserForBlogInputModel.blogId)

        if (!blogByBlogId) {
            throw new NotFoundException('This blog is banned')
        }

        if (blogByBlogId.user.id !== command.currentUserId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        const findedUserData = await this.usersRepository.findUserData(command.bannedUserId)

        console.log(command.banUserForBlogInputModel.blogId, command.bannedUserId, 'ban')

        const existingUserBanForBlog = await this.blogsQueryRepository.findBanUserForBlogByBlogId(command.banUserForBlogInputModel.blogId, command.bannedUserId)

        let banUserForBlog

        if (existingUserBanForBlog) {
            banUserForBlog = this.editExistingBanForBlog(existingUserBanForBlog, command.banUserForBlogInputModel.banReason)
        } else {
            banUserForBlog = this.createBanUserForBlog(findedUserData, blogByBlogId, command.banUserForBlogInputModel.banReason)
        }

        const savedBan = await this.blogsRepository.dataSourceSave(banUserForBlog)

        return savedBan ? true : false
    }

    editExistingBanForBlog(banForBlog: BansUsersForBlogs, banReason: string): BansUsersForBlogs {
        banForBlog.banReason = banReason
        banForBlog.isBanned = true
        banForBlog.banDate = new Date()

        return banForBlog
    }

    createBanUserForBlog(user: UserEntity, blog: BlogEntity, banReason: string): BansUsersForBlogs {
        const banUserForBlog = new BansUsersForBlogs()

        banUserForBlog.user = user
        banUserForBlog.banReason = banReason
        banUserForBlog.blog = blog
        banUserForBlog.isBanned = true
        banUserForBlog.banDate = new Date()

        return banUserForBlog
    }
}