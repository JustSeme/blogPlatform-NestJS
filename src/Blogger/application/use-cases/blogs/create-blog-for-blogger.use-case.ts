import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../api/models/BlogInputModel"
import { BlogViewModel } from "../../../../blogs/application/dto/BlogViewModel"
import { BlogDTO } from "../../../domain/blogs/BlogsTypes"
import { UsersQuerySQLRepository } from "../../../../SuperAdmin/infrastructure/users-query-sql-repository"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/blogs-sql-repository"

// Command
export class CreateBlogForBloggerCommand implements ICommand {
    constructor(
        public readonly blogInputModel: BlogInputModel,
        public readonly creatorId: string,
    ) { }
}

// Command Handler
@CommandHandler(CreateBlogForBloggerCommand)
export class CreateBlogForBloggerUseCase implements ICommandHandler<CreateBlogForBloggerCommand> {
    constructor(
        private readonly blogsRepository: BlogsSQLRepository,
        private readonly usersQueryRepository: UsersQuerySQLRepository
    ) { }

    async execute(command: CreateBlogForBloggerCommand): Promise<BlogViewModel> {
        const {
            blogInputModel,
            creatorId
        } = command

        const creator = await this.usersQueryRepository.findUserById(creatorId)

        const creatingBlog = new BlogDTO(
            blogInputModel.name,
            blogInputModel.description,
            blogInputModel.websiteUrl,
            false,
            creator.login,
            creator.id
        )

        return this.blogsRepository.createBlog(creatingBlog)
    }
}
