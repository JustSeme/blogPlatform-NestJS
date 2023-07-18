import { CommandHandler } from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../../api/models/blogs/BanBlogInputModel"
import { BlogsTypeORMRepository } from "../../../../Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"
import { BlogsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import {
    DataSource, EntityManager
} from "typeorm"
import { PostsTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"
import { TransactionBaseUseCase } from "../../../../general/use-cases/transaction-base.use-case"

export class BanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase extends TransactionBaseUseCase<BanBlogCommand, boolean>{
    constructor(
        protected blogsRepository: BlogsTypeORMRepository,
        protected blogsQueryRepository: BlogsQueryTypeORMRepository,
        protected postsRepository: PostsTypeORMRepository,
        @InjectDataSource() protected dataSource: DataSource,
    ) {
        super(dataSource)
    }

    async doLogic(input: BanBlogCommand, manager: EntityManager): Promise<boolean> {
        const blogByBlogId = await this.blogsQueryRepository.findBlogById(input.blogId)

        blogByBlogId.banDate = new Date()
        blogByBlogId.isBanned = true

        const savedBlog = await this.blogsRepository.queryRunnerSave(blogByBlogId, manager)

        const isPostsHided = await this.postsRepository.hidePostsForBlog(input.blogId)

        if (!savedBlog && !isPostsHided) {
            throw new Error('Blog is not saved or posts is not hided, rollback transaction')
        }

        return (isPostsHided && savedBlog) ? true : false
    }


    async execute(command: BanBlogCommand): Promise<boolean> {
        return super.execute(command)
    }
}