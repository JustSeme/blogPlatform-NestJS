import {
    CommandHandler, ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { BlogInputModel } from "../../../api/models/BlogInputModel"
import { BlogViewModel } from "../../../../blogs/application/dto/BlogViewModel"
import { BlogEntity } from "../../../domain/blogs/typeORM/blog.entity"
import { UsersTypeORMQueryRepository } from "../../../../SuperAdmin/infrastructure/typeORM/users-typeORM-query-repository"
import { BlogsTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-typeORM-repository"

// Command
export class CreateBlogForBloggerCommand implements ICommand {
    constructor(
        public readonly blogInputModel: BlogInputModel,
        public readonly creatorId: string,
    ) { }
}

// Command Handler
@CommandHandler(CreateBlogForBloggerCommand)
export class CreateBlogForBloggerUseCase implements ICommandHandler<CreateBlogForBloggerCommand> {
    constructor(
        private readonly blogsRepository: BlogsTypeORMRepository,
        private readonly usersQueryRepository: UsersTypeORMQueryRepository,
    ) { }

    async execute(command: CreateBlogForBloggerCommand): Promise<BlogViewModel> {
        const {
            blogInputModel,
            creatorId
        } = command

        const creator = await this.usersQueryRepository.findUserData(creatorId)

        const creatingBlog = new BlogEntity()
        creatingBlog.name = blogInputModel.name
        creatingBlog.description = blogInputModel.description
        creatingBlog.websiteUrl = blogInputModel.websiteUrl
        creatingBlog.createdAt = new Date()
        creatingBlog.ownerLogin = creator.login
        creatingBlog.user = creator

        const createdBlog = await this.blogsRepository.dataSourceSave(creatingBlog)

        return new BlogViewModel(createdBlog as BlogEntity)
    }
}
