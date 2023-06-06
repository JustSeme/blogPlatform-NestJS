import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BlogsRepository } from "../../../Blogger/infrastructure/blogs/blogs-db-repository"
import { generateErrorsMessages } from "../../../general/helpers"
import { BadRequestException } from '@nestjs/common'
import { UsersQueryRepository } from "../../infrastructure/users-query-repository"

export class BindUserCommand {
    constructor(
        public readonly blogId: string,
        public readonly userId: string,
    ) { }
}

@CommandHandler(BindUserCommand)
export class BindUserUseCase implements ICommandHandler<BindUserCommand> {
    constructor(
        private blogsRepository: BlogsRepository,
        private usersQueryRepository: UsersQueryRepository,
    ) { }

    async execute(command: BindUserCommand) {
        const {
            blogId,
            userId,
        } = command

        const blogById = await this.blogsRepository.findBlogById(blogId)
        if (blogById.blogOwnerInfo.userId !== 'superAdmin') {
            throw new BadRequestException(generateErrorsMessages('blog is already bounded with any user', 'blogId'))
        }

        const userById = await this.usersQueryRepository.findUserById(userId)

        await this.blogsRepository.bindBlogWithUser(blogId, userId, userById.login)
    }
}