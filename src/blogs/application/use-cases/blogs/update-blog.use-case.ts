import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../../Blogger/api/models/BlogInputModel"
import { BlogsSQLRepository } from "../../../../Blogger/infrastructure/blogs/blogs-sql-repository"

// Command
export class UpdateBlogCommand implements ICommand {
    constructor(public readonly id: string, public readonly body: BlogInputModel) { }
}


// Command Handler
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler {
    constructor(
        private readonly blogsRepository: BlogsSQLRepository
    ) { }


    async execute(command: UpdateBlogCommand): Promise<boolean> {
        const {
            id, body
        } = command
        return await this.blogsRepository.updateBlog(id, body)
    }
}