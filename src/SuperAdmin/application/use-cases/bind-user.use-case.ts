import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { generateErrorsMessages } from "../../../general/helpers"
import { BadRequestException } from '@nestjs/common'
import { BlogsQueryTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"
import { UsersTypeORMQueryRepository } from "../../infrastructure/typeORM/users-typeORM-query-repository"

export class BindUserCommand {
    constructor(
        public readonly blogId: string,
        public readonly userId: string,
    ) { }
}

@CommandHandler(BindUserCommand)
export class BindUserUseCase implements ICommandHandler<BindUserCommand> {
    constructor(
        private blogsRepository: BlogsTypeORMRepository,
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
        private usersQueryRepository: UsersTypeORMQueryRepository,
    ) { }

    async execute(command: BindUserCommand) {
        const {
            blogId,
            userId,
        } = command

        const blogById = await this.blogsQueryRepository.findOnlyUnbannedBlogById(blogId)

        if (!blogById) {
            throw new BadRequestException(generateErrorsMessages('The blog you want to link is banned', 'blogId'))
        }

        if (blogById.user.id !== 'superAdmin') {
            throw new BadRequestException(generateErrorsMessages('Blog is already bounded with any user', 'blogId'))
        }

        const userById = await this.usersQueryRepository.findUserData(userId)

        blogById.ownerLogin = userById.login
        blogById.user = userById

        await this.blogsRepository.dataSourceSave(blogById)
    }
}