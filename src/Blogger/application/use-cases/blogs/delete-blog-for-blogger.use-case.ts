import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ForbiddenException } from "@nestjs/common"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-typeORM-repository"

export class DeleteBlogForBloggerCommand {
    constructor(
        public readonly blogId: string,
        public readonly userId: string,
    ) { }
}


@CommandHandler(DeleteBlogForBloggerCommand)
export class DeleteBlogForBloggerUseCase implements ICommandHandler<DeleteBlogForBloggerCommand> {
    constructor(
        private blogsRepository: BlogsTypeORMRepository,
        private blogsQueryRepository: BlogsQueryTypeORMRepository
    ) { }

    async execute(command: DeleteBlogForBloggerCommand) {
        const deletingBlog = await this.blogsQueryRepository.findBlogById(command.blogId)

        if (deletingBlog.user.id !== command.userId) {
            throw new ForbiddenException('this is not your own')
        }
        return this.blogsRepository.deleteBlog(command.blogId)
    }
}