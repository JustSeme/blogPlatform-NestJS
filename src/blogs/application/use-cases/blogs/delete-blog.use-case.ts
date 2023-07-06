import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BlogsTypeORMRepository } from "../../../../Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"

export class DeleteBlogCommand {
    constructor(public id: string) { }
}


@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
    constructor(
        private blogsRepository: BlogsTypeORMRepository
    ) { }

    async execute(command: DeleteBlogCommand) {
        return this.blogsRepository.deleteBlog(command.id)
    }
}