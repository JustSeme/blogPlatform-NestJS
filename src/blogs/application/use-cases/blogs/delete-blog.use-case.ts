import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BlogsRepository } from "../../../../Blogger/infrastructure/blogs/blogs-db-repository"

export class DeleteBlogCommand {
    constructor(public id: string) { }
}


@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
    constructor(
        private blogsRepository: BlogsRepository
    ) { }

    async execute(command: DeleteBlogCommand) {
        return this.blogsRepository.deleteBlog(command.id)
    }
}