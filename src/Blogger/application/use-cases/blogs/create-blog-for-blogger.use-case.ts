import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../api/models/BlogInputModel"
import { BlogsRepository } from "../../../infrastructure/blogs/blogs-db-repository"
import { BlogViewModel } from "../../../../blogs/application/dto/BlogViewModel"
import { BlogDBModel } from "../../../domain/blogs/BlogsTypes"
import { BlogsService } from "../../../../blogs/application/blogs-service"
import { UsersQuerySQLRepository } from "../../../../SuperAdmin/infrastructure/users-query-sql-repository"

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
        private readonly blogsRepository: BlogsRepository,
        private readonly blogsService: BlogsService,
        private readonly usersQueryRepository: UsersQuerySQLRepository
    ) { }

    async execute(command: CreateBlogForBloggerCommand): Promise<BlogViewModel> {
        const {
            blogInputModel,
            creatorId
        } = command

        const creator = await this.usersQueryRepository.findUserById(creatorId)

        const createdBlog = new BlogDBModel(
            blogInputModel.name,
            blogInputModel.description,
            blogInputModel.websiteUrl,
            false,
            creator.login,
            creator.id
        )

        await this.blogsRepository.createBlog(createdBlog)

        const displayedBlog = this.blogsService.prepareBlogForDisplay([createdBlog])
        return displayedBlog[0]
    }
}
