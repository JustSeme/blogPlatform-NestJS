import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BlogsRepository } from "../../../../blogs/infrastructure/blogs/blogs-db-repository"
import { ForbiddenException } from "@nestjs/common"

export class DeleteBlogForBloggerCommand {
    constructor(
        public readonly blogId: string,
        public readonly userId: string,
    ) { }
}


@CommandHandler(DeleteBlogForBloggerCommand)
export class DeleteBlogForBloggerUseCase implements ICommandHandler<DeleteBlogForBloggerCommand> {
    constructor(
        private blogsRepository: BlogsRepository
    ) { }

    async execute(command: DeleteBlogForBloggerCommand) {
        const deletingBlog: any = await this.blogsRepository.findBlogById(command.blogId)
        if (deletingBlog.blogOwnerInfo.userId !== command.userId) {
            throw new ForbiddenException('this is not your own')
        }
        return this.blogsRepository.deleteBlog(command.blogId)
    }
}