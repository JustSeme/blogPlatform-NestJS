import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../api/models/BanBlogInputModel"
import { BlogsRepository } from "../../../Blogger/infrastructure/blogs/blogs-db-repository"
import { PostsRepository } from "../../../Blogger/infrastructure/posts/posts-db-repository"

export class BanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
    constructor(
        private blogsRepository: BlogsRepository,
        private postsRepository: PostsRepository
    ) { }


    async execute(command: BanBlogCommand): Promise<boolean> {
        const isBanned = await this.blogsRepository.updateBanBlog(command.blogId, command.banInputModel)

        const isHided = await this.postsRepository.hidePostsByBlogId(command.blogId)
        return isBanned && isHided
    }
}