import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ForbiddenException } from "@nestjs/common"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/rawSQL/blogs-sql-repository"

export class DeleteBlogForBloggerCommand {
    constructor(
        public readonly blogId: string,
        public readonly userId: string,
    ) { }
}


@CommandHandler(DeleteBlogForBloggerCommand)
export class DeleteBlogForBloggerUseCase implements ICommandHandler<DeleteBlogForBloggerCommand> {
    constructor(
        private blogsRepository: BlogsSQLRepository
    ) { }

    async execute(command: DeleteBlogForBloggerCommand) {
        const deletingBlog = await this.blogsRepository.findBlogById(command.blogId)

        if (deletingBlog.user !== command.userId) {
            throw new ForbiddenException('this is not your own')
        }
        return this.blogsRepository.deleteBlog(command.blogId)
    }
}