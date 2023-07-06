import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../api/models/BlogInputModel"
import {
    BadRequestException, ForbiddenException
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/rawSQL/blogs-sql-repository"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"

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
        private readonly blogsRepository: BlogsSQLRepository,
        private readonly blogsQueryRepository: BlogsQueryTypeORMRepository,
    ) { }

    async execute(command: UpdateBlogForBloggerCommand): Promise<boolean> {
        const blogById = await this.blogsQueryRepository.findOnlyUnbannedBlogById(command.blogId)

        if (!blogById) {
            throw new BadRequestException('This blog is banned')
        }

        if (blogById.user.id !== command.bloggerId) {
            throw new ForbiddenException(generateErrorsMessages('that is not your own', 'authorization header'))
        }

        await this.blogsRepository.updateBlog(command.blogId, command.blogInputModel)
        return true
    }
}