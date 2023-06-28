import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { generateErrorsMessages } from "../../../general/helpers"
import { BadRequestException } from '@nestjs/common'
import { UsersQuerySQLRepository } from "../../infrastructure/rawSQL/users-query-sql-repository"
import { BlogsSQLRepository } from "../../../Blogger/infrastructure/blogs/rawSQL/blogs-sql-repository"

export class BindUserCommand {
    constructor(
        public readonly blogId: string,
        public readonly userId: string,
    ) { }
}

@CommandHandler(BindUserCommand)
export class BindUserUseCase implements ICommandHandler<BindUserCommand> {
    constructor(
        private blogsRepository: BlogsSQLRepository,
        private usersQueryRepository: UsersQuerySQLRepository,
    ) { }

    async execute(command: BindUserCommand) {
        const {
            blogId,
            userId,
        } = command

        const blogById = await this.blogsRepository.findBlogById(blogId)
        if (blogById.user !== 'superAdmin') {
            throw new BadRequestException(generateErrorsMessages('blog is already bounded with any user', 'blogId'))
        }

        const userById = await this.usersQueryRepository.findUserById(userId)

        await this.blogsRepository.bindBlogWithUser(blogId, userId, userById.login)
    }
}