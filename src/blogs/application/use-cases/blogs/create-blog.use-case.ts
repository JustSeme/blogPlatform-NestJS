import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../api/models/BlogInputModel"
import { BlogsRepository } from "../../../infrastructure/blogs/blogs-db-repository"
import { BlogViewModel } from "../../dto/BlogViewModel"
import { BlogDBModel } from "../../../domain/blogs/BlogsTypes"

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
        private readonly blogsRepository: BlogsRepository
    ) { }

    async execute(command: CreateBlogCommand): Promise<BlogViewModel> {
        const { blogInputModel } = command
        const createdBlog = new BlogDBModel(
            blogInputModel.name,
            blogInputModel.description,
            blogInputModel.websiteUrl,
            false,
            'superAdmin',
            'superAdmin',
        )
        await this.blogsRepository.createBlog(createdBlog)
        return createdBlog
    }
}
