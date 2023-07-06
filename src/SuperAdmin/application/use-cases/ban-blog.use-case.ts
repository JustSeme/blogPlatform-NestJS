import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../api/models/BanBlogInputModel"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/rawSQL/posts-sql-repository"
import { BlogsTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"
import { BlogsQueryTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"

export class BanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
    constructor(
        private blogsRepository: BlogsTypeORMRepository,
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
        private postsRepository: PostsSQLRepository,
    ) { }


    async execute(command: BanBlogCommand): Promise<boolean> {
        const blogByBlogId = await this.blogsQueryRepository.findBlogById(command.blogId)

        blogByBlogId.banDate = new Date()
        blogByBlogId.isBanned = true

        const savedBlog = await this.blogsRepository.dataSourceSave(blogByBlogId)

        const isHided = await this.postsRepository.hidePostsByBlogId(command.blogId)
        return savedBlog && isHided
    }
}