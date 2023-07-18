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

export class UpdateBanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(UpdateBanBlogCommand)
export class UpdateBanBlogUseCase extends TransactionBaseUseCase<UpdateBanBlogCommand, boolean>{
    constructor(
        protected blogsRepository: BlogsTypeORMRepository,
        protected blogsQueryRepository: BlogsQueryTypeORMRepository,
        protected postsRepository: PostsTypeORMRepository,
        @InjectDataSource() protected dataSource: DataSource,
    ) {
        super(dataSource)
    }

    async doLogic(input: UpdateBanBlogCommand, manager: EntityManager): Promise<boolean> {
        const blogByBlogId = await this.blogsQueryRepository.findBlogById(input.blogId)

        blogByBlogId.banDate = new Date()
        blogByBlogId.isBanned = input.banInputModel.isBanned

        const savedBlog = await this.blogsRepository.queryRunnerSave(blogByBlogId, manager)

        const isPostsSaved = await this.postsRepository.updateIsBannedForPostsByBlogId(input.blogId, input.banInputModel.isBanned)

        if (!savedBlog && !isPostsSaved) {
            throw new Error('Blog is not saved or posts is not hided, rollback transaction')
        }

        return (isPostsSaved && savedBlog) ? true : false
    }


    async execute(command: UpdateBanBlogCommand): Promise<boolean> {
        return super.execute(command)
    }
}