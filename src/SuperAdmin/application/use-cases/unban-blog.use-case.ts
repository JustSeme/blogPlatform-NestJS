import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../api/models/BanBlogInputModel"
import { BlogsSQLRepository } from "../../../Blogger/infrastructure/blogs/blogs-sql-repository"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/posts-sql-repository"

export class UnbanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(UnbanBlogCommand)
export class UnbanBlogUseCase implements ICommandHandler<UnbanBlogCommand> {
    constructor(
        private blogsRepository: BlogsSQLRepository,
        private postsRepository: PostsSQLRepository
    ) { }


    async execute(command: UnbanBlogCommand): Promise<boolean> {
        const isBanned = await this.blogsRepository.unbanBlog(command.blogId)

        const isUnhided = await this.postsRepository.unHidePostsByBlogId(command.blogId)
        return isBanned && isUnhided
    }
}