import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../../blogs/api/models/BlogInputModel"
import { BlogsRepository } from "../../../../blogs/infrastructure/blogs/blogs-db-repository"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"

export class UpdateBlogForBloggerCommand {
    constructor(
        public readonly blogInputModel: BlogInputModel,
        public readonly blogId: string,
        public readonly bloggerId: string
    ) { }
}


@CommandHandler(UpdateBlogForBloggerCommand)
export class UpdateBlogForBloggerUseCase implements ICommandHandler<UpdateBlogForBloggerCommand> {
    constructor(
        private readonly blogsRepository: BlogsRepository
    ) { }

    async execute(command: UpdateBlogForBloggerCommand): Promise<boolean> {
        const blogById = await this.blogsRepository.findBlogById(command.blogId)

        if (blogById.blogOwnerInfo.userId !== command.bloggerId) {
            throw new ForbiddenException(generateErrorsMessages('that is not your own', 'authorization header'))
        }

        await this.blogsRepository.updateBlog(command.blogId, command.blogInputModel)
        return true
    }
}