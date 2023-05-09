import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { BlogsRepository } from "../../../../Blogger/infrastructure/blogs/blogs-db-repository"
import { BlogInputModel } from "../../../../Blogger/api/models/BlogInputModel"

// Command
export class UpdateBlogCommand implements ICommand {
    constructor(public readonly id: string, public readonly body: BlogInputModel) { }
}


// Command Handler
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler {
    constructor(
        private readonly blogsRepository: BlogsRepository
    ) { }


    async execute(command: UpdateBlogCommand): Promise<boolean> {
        const {
            id, body
        } = command
        return await this.blogsRepository.updateBlog(id, body)
    }
}