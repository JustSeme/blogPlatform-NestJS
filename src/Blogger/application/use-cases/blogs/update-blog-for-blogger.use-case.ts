import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../api/models/BlogInputModel"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/rawSQL/blogs-sql-repository"

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
        private readonly blogsRepository: BlogsSQLRepository
    ) { }

    async execute(command: UpdateBlogForBloggerCommand): Promise<boolean> {
        const blogById = await this.blogsRepository.findBlogById(command.blogId)

        if (blogById.user !== command.bloggerId) {
            throw new ForbiddenException(generateErrorsMessages('that is not your own', 'authorization header'))
        }

        await this.blogsRepository.updateBlog(command.blogId, command.blogInputModel)
        return true
    }
}