import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BlogsSQLRepository } from "../../../../Blogger/infrastructure/blogs/rawSQL/blogs-sql-repository"

export class DeleteBlogCommand {
    constructor(public id: string) { }
}


@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
    constructor(
        private blogsRepository: BlogsSQLRepository
    ) { }

    async execute(command: DeleteBlogCommand) {
        return this.blogsRepository.deleteBlog(command.id)
    }
}