import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../../Blogger/api/models/BlogInputModel"
import { BlogViewModel } from "../../dto/BlogViewModel"
import { BlogDTO } from "../../../../Blogger/domain/blogs/BlogsTypes"
import { BlogsSQLRepository } from "../../../../Blogger/infrastructure/blogs/blogs-sql-repository"

// Command
export class CreateBlogCommand implements ICommand {
    constructor(
        public readonly blogInputModel: BlogInputModel
    ) { }
}

// Command Handler
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
    constructor(
        private readonly blogsRepository: BlogsSQLRepository
    ) { }

    async execute(command: CreateBlogCommand): Promise<BlogViewModel> {
        const { blogInputModel } = command

        const creatingBlog = new BlogDTO(
            blogInputModel.name,
            blogInputModel.description,
            blogInputModel.websiteUrl,
            false,
            'superAdmin',
            'superAdmin',
        )

        const createdBlog = await this.blogsRepository.createBlog(creatingBlog)
        return new BlogViewModel(createdBlog)
    }
}
