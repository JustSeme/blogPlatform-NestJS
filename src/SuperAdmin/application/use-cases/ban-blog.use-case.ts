import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../api/models/BanBlogInputModel"
import { BlogsSQLRepository } from "../../../Blogger/infrastructure/blogs/rawSQL/blogs-sql-repository"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/posts-sql-repository"

export class BanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
    constructor(
        private blogsRepository: BlogsSQLRepository,
        private postsRepository: PostsSQLRepository
    ) { }


    async execute(command: BanBlogCommand): Promise<boolean> {
        const isBanned = await this.blogsRepository.banBlog(command.blogId)

        const isHided = await this.postsRepository.hidePostsByBlogId(command.blogId)
        return isBanned && isHided
    }
}