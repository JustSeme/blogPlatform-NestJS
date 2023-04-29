import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BlogsRepository } from "../../../blogs/infrastructure/blogs/blogs-db-repository"
import { UsersRepository } from "../../../auth/infrastructure/users-db-repository"
import { generateErrorsMessages } from "../../../general/helpers"
import { BadRequestException } from '@nestjs/common'

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
        private usersRepository: UsersRepository,
    ) { }

    async execute(command: BindUserCommand) {
        const {
            blogId,
            userId,
        } = command

        const blogById = await this.blogsRepository.findBlogById(blogId)
        if (blogById.blogOwnerInfo.userId !== 'superAdmin') {
            throw new BadRequestException(generateErrorsMessages('blog is already binded with any user', 'blogId'))
        }

        const userById = await this.usersRepository.findUserById(userId)

        await this.blogsRepository.bindBlogWithUser(blogId, userId, userById.login)
    }
}