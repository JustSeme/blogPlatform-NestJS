import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../../Blogger/api/models/BlogInputModel"
import { BlogsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "../../../../Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"

// Command
export class UpdateBlogCommand implements ICommand {
    constructor(public readonly id: string, public readonly body: BlogInputModel) { }
}


// Command Handler
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler {
    constructor(
        private readonly blogsRepository: BlogsTypeORMRepository,
        private readonly blogsQueryRepository: BlogsQueryTypeORMRepository,
    ) { }


    async execute(command: UpdateBlogCommand): Promise<boolean> {
        const {
            id, body
        } = command

        const blogById = await this.blogsQueryRepository.findBlogById(id)

        blogById.name = body.name
        blogById.description = body.description
        blogById.websiteUrl = body.websiteUrl

        const updatedBlog = await this.blogsRepository.dataSourceSave(blogById)

        return updatedBlog ? true : false
    }
}