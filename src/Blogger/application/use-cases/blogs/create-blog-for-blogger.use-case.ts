import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../../blogs/api/models/BlogInputModel"
import { BlogsRepository } from "../../../../blogs/infrastructure/blogs/blogs-db-repository"
import { BlogViewModel } from "../../../../blogs/application/dto/BlogViewModel"
import { BlogDBModel } from "../../../../blogs/domain/blogs/BlogsTypes"
import { BlogsService } from "../../../../blogs/application/blogs-service"
import { UsersQueryRepository } from "../../../../general/users/infrastructure/users-query-repository"

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
        private readonly usersQueryRepository: UsersQueryRepository
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
