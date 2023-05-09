import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../api/models/BanBlogInputModel"
import { BlogsRepository } from "../../../Blogger/infrastructure/blogs/blogs-db-repository"
import { PostsRepository } from "../../../Blogger/infrastructure/posts/posts-db-repository"

export class UnbanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(UnbanBlogCommand)
export class UnbanBlogUseCase implements ICommandHandler<UnbanBlogCommand> {
    constructor(
        private blogsRepository: BlogsRepository,
        private postsRepository: PostsRepository
    ) { }


    async execute(command: UnbanBlogCommand): Promise<boolean> {
        const isBanned = await this.blogsRepository.updateBanBlog(command.blogId, command.banInputModel)

        const isUnhided = await this.postsRepository.unHidePostsByBlogId(command.blogId)
        return isBanned && isUnhided
    }
}