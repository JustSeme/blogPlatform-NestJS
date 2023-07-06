import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../api/models/BanBlogInputModel"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/rawSQL/posts-sql-repository"
import { BlogsQueryTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"

export class UnbanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(UnbanBlogCommand)
export class UnbanBlogUseCase implements ICommandHandler<UnbanBlogCommand> {
    constructor(
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
        private blogsRepository: BlogsTypeORMRepository,
        private postsRepository: PostsSQLRepository
    ) { }


    async execute(command: UnbanBlogCommand): Promise<boolean> {
        const blogByBlogId = await this.blogsQueryRepository.findBlogById(command.blogId)

        blogByBlogId.banDate = null
        blogByBlogId.isBanned = false

        const savedBlog = await this.blogsRepository.dataSourceSave(blogByBlogId)

        const isUnhided = await this.postsRepository.unHidePostsByBlogId(command.blogId)
        return savedBlog && isUnhided
    }
}